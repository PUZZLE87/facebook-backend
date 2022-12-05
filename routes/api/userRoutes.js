import express from "express";
import userController from "../../controllers/userController.js";
import registerValidator from "../../validators/registerValidator.js";
import authValidator from "../../validators/authValidator.js";
import verifyJWT from "../../middlewares/verifyJWT.js";

const router = express.Router();

// public routes
router.post("/register", registerValidator(), userController.register);
router.post("/auth", authValidator(), userController.auth);
router.get("/refresh", userController.refreshTokn);
router.post("/findUser", userController.findUser);
router.post("/sendResetPasswordCode", userController.sendResetPasswordCode);
router.post("/validateResetCode", userController.validateResetCode);
router.post("/changePassword", userController.changePassword);

// protected routes
router.use(verifyJWT);
router.post("/activate", userController.activateAccount);
router.post("/sendVerification", userController.sendVerificationEmail);
router.get("/logout", userController.logout);

export default router;
