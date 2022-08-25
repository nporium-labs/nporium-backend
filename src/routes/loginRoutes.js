const express = require("express"),
  router = express.Router(),
  signup = require("../middleware/accounts.middleware"),
  loginController = require("../controller/loginController");

require("dotenv").config();
const app = express();

router.post(
  "/",
  // dashboard
  loginController.getHello
);

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
  // userMiddleWare.isUserExist,
  signup.isUserExist,
  // forgetPassword
  loginController.forgetPassword
);

router.put(
  "/api/updateNewPassword/:token",
  // userMiddleWare.isRestPaswordTokenValid,
  signup.isRestPaswordTokenValid,
  // updateNewPassword
  loginController.updateNewPassword
);

router.get(
  "/api/getUserData",
  // userMiddleWare.isUserExist,
  signup.isUserExist,
  // getAllUsers
  loginController.getAllUsers
);

router.post(
  "/api/getUser",
  // userMiddleWare.isUserExist,isTokenValid
  signup.isRegistered,
  signup.isUserHaveRole,
  // userSignIn
  loginController.getUser
);

router.post(
  "/api/addNewUserRole",
  // userMiddleWare.isUserExist,isTokenValid
  signup.isTokenValid,
  signup.isUserExist,
  signup.isRoleExist,
  signup.isUserHaveRights,
  signup.isUserHaveRole,

  //   setNewRole,
  loginController.setNewRole
);

module.exports = router;
