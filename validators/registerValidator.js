import { body } from "express-validator";
import User from "../models/userModel.js";

const registerValidator = () => {
  return [
    body("first_name")
      .isLength({ min: 4 })
      .withMessage("First name must be at least 4 chars long"),
    body("last_name")
      .isLength({ min: 4 })
      .withMessage("Last name must be at least 4 chars long"),
    body("email")
      .isEmail()
      .withMessage("Invalid email address")
      .custom(async (value) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("Email already in use");
          }
        });
      }),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 chars length")
      .matches(/(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-zA-Z])/)
      .withMessage(
        "Password must contain string, at least one special and one numeric character"
      ),
    body("bYear")
      .not()
      .isEmpty()
      .withMessage("Bearth year can not be empty")
      .isInt({ min: 1950 })
      .withMessage("Bearth year must be at least 1950"),
    body("bMonth")
      .not()
      .isEmpty()
      .withMessage("Bearth month can not be empty")
      .isInt({ min: 1, max: 12 })
      .withMessage("Bearth month must be between 1 and 12"),
    body("bDay")
      .not()
      .isEmpty()
      .withMessage("Bearth day can not be empty")
      .isInt({ min: 1, max: 31 })
      .withMessage("Bearth day muse be between 1 and 31"),
    body("gender")
      .isIn(["male", "female", "custom"])
      .withMessage("gender can be male, female or custom"),
  ];
};

export default registerValidator;
