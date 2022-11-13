import { validationResult } from "express-validator";
import UserModel from "../models/userModel.js";
import sendVerificationEmail from "../utilities/mailer.js";
import jwt from "jsonwebtoken";
import CodeModel from "../models/codeModel.js";
import randomstring from "randomstring";
import { sendResetPasswordCode } from "../utilities/mailer.js";

class UserController {
  constructor() {}

  //login
  async auth(req, res) {
    const cookies = req.cookies;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const foundUser = await UserModel.findOne({ email });

    if (!foundUser) return res.sendStatus(401);

    if (!foundUser.comparePassword(password)) {
      return res.sendStatus(401);
    }

    const accessToken = jwt.sign(
      { id: foundUser.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "5m" }
    );

    const newRefreshToken = jwt.sign(
      { id: foundUser.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "15d" }
    );

    let newRefreshTokenArray = !cookies?.jwt
      ? foundUser.refreshToken
      : foundUser.refreshToken.filter((rt) => rt !== cookies.jwt);

    if (cookies?.jwt) {
      const refreshToken = cookies.jwt;
      const foundToken = await UserModel.findOne({ refreshToken });
      if (!foundToken) {
        newRefreshTokenArray = [];
      }
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    }

    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];

    await foundUser.save();

    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 15,
    });

    const userInfo = {
      first_name: foundUser.first_name,
      last_name: foundUser.last_name,
      picture: foundUser.picture,
      username: foundUser.username,
      verified: foundUser.verified,
    };

    res.json({ accessToken, userInfo });
  }

  //register
  async register(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const newUser = await new UserModel({
        ...req.body,
        username: req.body.first_name + req.body.last_name,
      });
      newUser.username = await newUser.generateUsername();

      const mailVerificationToken = jwt.sign(
        { id: newUser._id.toString() },
        process.env.MAIL_JWT_TOKEN,
        { expiresIn: "30m" }
      );

      const url = `${process.env.BASE_URL}/activate/${mailVerificationToken}`;
      sendVerificationEmail(newUser.email, newUser.first_name, url);

      await newUser.save();

      res.json({ message: "new user successfully created" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  //verify account with token
  async activateAccount(req, res) {
    const { token } = req.body;
    if (!token) return res.status(400).json({ messge: "token not valid" });

    jwt.verify(token, process.env.MAIL_JWT_TOKEN, async (err, user) => {
      if (err) return res.status(400).json({ message: "Invalid token" });

      const foundUser = await UserModel.findById(user.id);
      if (!foundUser) return res.status(400).json({ message: "Invalid token" });

      if (foundUser.id !== req.userId)
        return res.status(403).json({ message: "Invalid token" });

      if (foundUser.verified === true) {
        return res
          .status(400)
          .json({ message: "this email is already activated" });
      } else {
        await UserModel.findByIdAndUpdate(user.id, { verified: true });
        return res
          .status(200)
          .json({ message: "Account activated successfully" });
      }
    });
  }

  //refresh token
  async refreshToken(req, res) {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(401);

    const refreshToken = cookies.jwt;

    res.clearCookie("jwt", { httOnly: true, sameSite: "None", secure: true });

    const foundUser = await UserModel.findOne({ refreshToken });

    if (!foundUser) {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) return;

          const hackedUser = await UserModel.findOne({ id: decoded.id });

          if (hackedUser) {
            hackedUser.refreshToken = [];
            await hackedUser.save();
          }
        }
      );
      return res.sendStatus(403);
    }

    const newRefreshTokenArray = foundUser.refreshToken.filter(
      (rt) => rt !== refreshToken
    );

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          //change this line newRefreshTokenArray
          foundUser.refreshToken = [...newRefreshTokenArray];
          await foundUser.save();
        }

        if (err || foundUser.id !== decoded.id) return res.sendStatus(403);

        const accessToken = jwt.sign(
          { id: decoded.id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "5m" }
        );

        const newRefreshToken = jwt.sign(
          { id: foundUser.id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "15d" }
        );

        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];

        await foundUser.save();

        res.cookie("jwt", newRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 1000 * 60 * 60 * 24 * 15,
        });

        const userInfo = {
          first_name: foundUser.first_name,
          last_name: foundUser.last_name,
          picture: foundUser.picture,
          username: foundUser.username,
          verified: foundUser.verified,
        };
        res.json({ accessToken, userInfo });
      }
    );
  }

  // resend verification email
  async sendVerEmail(req, res) {
    try {
      const id = req.userId;
      const user = await UserModel.findById(id);
      if (user.verified === true)
        return res
          .status(400)
          .json({ message: "this account is already activated" });

      const mailVerificationToken = jwt.sign(
        { id: id.toString() },
        process.env.MAIL_JWT_TOKEN,
        { expiresIn: "30m" }
      );
      const url = `${process.env.BASE_URL}/activate/${mailVerificationToken}`;
      sendVerificationEmail(user.email, user.first_name, url);
      return res.status(200).json({
        message: "Email verification link has been sent to your email",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async logout(req, res) {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);
    const refreshToken = cookies.jwt;
    const foundUser = await UserModel.findOne({ refreshToken });
    if (!foundUser) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return res.sendStatus(204);
    }

    foundUser.refreshToken = foundUser.refreshToken.filter(
      (rt) => rt !== refreshToken
    );
    await foundUser.save();
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    res.sendStatus(204);
  }

  async findUser(req, res) {
    try {
      const { email } = req.body;
      if (!email)
        return res.status(400).json({ message: "Not valid email address" });
      const user = await UserModel.findOne({ email }).select("-password");
      if (!user) {
        return res.status(400).json({ message: "Account does not exist" });
      }
      res.status(200).json({ email: user?.email, picture: user?.picture });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async sendResetPasswordCode(req, res) {
    try {
      const { email } = req.body;
      if (!email)
        return res.status(400).json({ message: "Not valid email address" });
      const user = await UserModel.findOne({ email }).select("-password");
      if (!user) {
        return res.status(400).json({ message: "Account does not exist" });
      }
      await CodeModel.findOneAndRemove({ user: user.id });
      const code = randomstring.generate(5);
      await new CodeModel({
        code,
        user: user.id,
      }).save();
      sendResetPasswordCode(user.email, user.first_name, code);
      res.json({ message: "Email reset code has been sent to your email" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async validateResetCode(req, res) {
    try {
      const { email, code } = req.body;
      if (!email || !code)
        return res.status(400).json({ message: "Email or Code is empty" });
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Account does not exist" });
      }

      const dbCode = await CodeModel.findOne({ user: user.id });
      if (dbCode?.code !== code)
        return res
          .status(400)
          .json({ message: "verification code is wrong..." });

      res.status(200).json({ code });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async changePassword(req, res) {
    const { email, password, code } = req.body;
    if (!email || !password || !code) {
      return res
        .status(400)
        .json({ message: "Email, Password or Code can not be empty" });
    }
    try {
      const user = await UserModel.findOne({ email });
      if (!user) return res.status(400).json({ message: "User not found" });
      const dbCode = await CodeModel.findOne({ user: user.id });
      if (dbCode?.code !== code)
        return res
          .status(400)
          .json({ message: "verification code is wrong..." });
      user.password = password;
      await user.save();
      await dbCode.remove();
      res.json({ message: "OK" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new UserController();
