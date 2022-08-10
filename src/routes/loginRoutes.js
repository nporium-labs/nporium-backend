const express = require("express"),
  router = express.Router(),
  signup = require("../middleware/accounts.middleware"),
  loginController = require("../controller/loginController");

require("dotenv").config();
const app = express();

router.post(
  "/api/signup",
  // userMiddleWare.isRegistered,
  signup.isRegistered,
  // userSignup
  loginController.signup
);

router.post(
  "/api/login",
  // userMiddleWare.isAuthenticated,
  signup.isAuthenticated,
  // userSignIn
  loginController.login
);

router.post(
  "/api/loginWithGoogle",
  // userMiddleWare.isGoogleAuthenticated,
  signup.isGoogleAuthenticated,
  // userSignIn
  loginController.loginWithGoogle
);

router.post(
  "/api/forgetPassword",
  // userMiddleWare.isGoogleAuthenticated,
  signup.isAuthenticated,
  // userSignIn
  loginController.forgetPassword
);

router.get("/api/getUserData", loginController.getAllUsers);

module.exports = router;
