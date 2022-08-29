import { body } from "express-validator";

const authvalidator = () => {
  return [
    body("email")
      .not()
      .isEmpty()
      .isEmail()
      .withMessage("Invalid email address"),
    body("password").not().isEmpty().withMessage("Invalid credentials"),
  ];
};

export default authvalidator;
