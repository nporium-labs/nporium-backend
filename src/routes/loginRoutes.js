const express = require("express"),
  router = express.Router(),
  signup = require("../middleware/accounts.middleware"),
  loginController = require("../controller/loginController"),
  adminController = require("../controller/adminController");

require("dotenv").config();
const app = express();

let baseUrl = process.env.SERVER_URL;

router.get(
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
  signup.isUserSessionAuthenticated,
  signup.isUserExist,
  // getAllUsers
  loginController.getAllUsers
);

router.post(
  "/api/getUser",
  // userMiddleWare.isRegistered,isUserHaveRole
  signup.isUserSessionAuthenticated,
  signup.isRegistered,
  signup.isUserHaveRole,
  // userSignIn
  loginController.getUser
);

router.post(
  "/api/addNewUserRole",
  // userMiddleWare.isUserExist, isUserSessionAuthenticated, isRoleExist, isUserHaveRights, isUserHaveRole
  signup.isUserSessionAuthenticated,
  signup.isUserExist,
  signup.isRoleExist,
  signup.isUserHaveRights,
  signup.isUserHaveRole,
  //   setNewRole,
  loginController.setNewRole
);

router.post(
  "/api/logout",
  // userMiddleWare.isUserSessionAuthenticated
  signup.isUserSessionAuthenticated,
  //   logOut,
  loginController.logOut
);

router.post(
  "/api/mintNFT",
  // userMiddleWare.isUserSessionAuthenticated, isUserHaveRights, isNFTDataValid, upload.single("media")
  signup.isUserSessionAuthenticated,
  signup.isUserHaveRights,
  signup.upload.single("media"),
  signup.isNFTDataValid,
  //   mintNFT,
  adminController.mintNFT
);

router.post(
  "/api/listNFTForSale",
  // userMiddleWare.isUserSessionAuthenticated, isUserHaveRights, isSaleListDataValid
  signup.isUserSessionAuthenticated,
  signup.isUserHaveRights,
  signup.isSaleListDataValid,
  //   mintNFT,
  adminController.listNFTForSale
);

router.post(
  "/api/unlistNFTFromSale",
  // userMiddleWare.isUserSessionAuthenticated, isUserHaveRights, isSaleUnListDataValid
  signup.isUserSessionAuthenticated,
  signup.isUserHaveRights,
  signup.isSaleUnListDataValid,
  //   unlistNFTFromSale,
  adminController.unlistNFTFromSale
);

router.post(
  "/api/updatelistNFTPrice",
  // userMiddleWare.isUserSessionAuthenticated, isUserHaveRights, isUpdatelistNFTPriceValid
  signup.isUserSessionAuthenticated,
  signup.isUserHaveRights,
  signup.isUpdatelistNFTPriceValid,
  //   unlistNFTFromSale,
  adminController.updatelistNFTPrice
);

router.post(
  "/api/updateRoyalityCut",
  // userMiddleWare.isUserSessionAuthenticated, isUserHaveRights, isMarketORRoyalityValid
  signup.isUserSessionAuthenticated,
  signup.isUserHaveRights,
  signup.isMarketOrRoyalityValid,
  //   updateRoyalityCut,
  adminController.updateRoyalityCut
);

router.post(
  "/api/updateMarketingCut",
  // userMiddleWare.isUserSessionAuthenticated, isUserHaveRights, isMarketORRoyalityValid
  signup.isUserSessionAuthenticated,
  signup.isUserHaveRights,
  signup.isMarketOrRoyalityValid,
  //   updateRoyalityCut,
  adminController.updateMarketingCut
);

module.exports = router;
