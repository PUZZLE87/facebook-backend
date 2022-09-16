import registerValidator from "../../validators/registerValidator.js";
import authValidator from "../../validators/authValidator.js";
import express from "express";
import userController from "../../controllers/userController.js";
import verifyJWT from "../../middlewares/verifyJWT.js";

const router = express.Router();

router.post("/register", registerValidator(), userController.register);
router.post("/auth", authValidator(), userController.auth);
router.get("/refresh", userController.refreshToken);

// protected routes
router.use(verifyJWT);
router.post("/activate", userController.activateAccount);
router.post("/sendVerification", userController.sendVerEmail);

export default router;
