const mongoose = require("mongoose"),
  userAccount = mongoose.model("userAccount"),
  usersPaswords = mongoose.model("usersPasword"),
  crypto = require("crypto"),
  bcrypt = require("bcryptjs"),
  multer = require("multer"),
  fs = require("fs"),
  path = require("path"),
  { body, validationResult } = require("express-validator"),
  loginController = require("../controller/loginController"),
  jwtwebtoken = require("jsonwebtoken"),
  userRoles = require("../utilities/roles"),
  result = require("../response/result"),
  messages = require("../utilities/errormessages");
const e = require("express");
const { admin, superAdmin } = require("../utilities/roles");
require("dotenv").config();

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    // console.log(__dirname);
    cb(null, path.join(__dirname, "../../public/assets"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });

const uploadedToIpfc = (req, res, next) => {
  upload.single("media");
  next();
};

const isEmailIsValid = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

const isValidPassword = (password) => {
  if (password.length > 5 && password.length < 20) {
    return true;
  } else {
    return false;
  }
};

const isRegistered = async (req, res, next) => {
  try {
    if (req.body?.email) {
      req.body.email = req.body.email.toLowerCase();
      const user = await userAccount.findOne({
        email: req.body.email,
      });
      if (user && user != null) {
        result.isError = true;
        result.message = messages.userExist;
        return res.status(404).send(result);
      }
    } else {
      result.isError = true;
      result.message = messages.invalidPayload;
      return res.status(404).send(result);
    }
    next();
  } catch (error) {
    result.isError = true;
    result.message = messages.error;
    return res.status(404).send(result);
  }
};

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.body?.email) {
      const user = await userAccount.findOne({
        email: req.body.email,
      });
      if (!user && user == null) {
        result.isError = true;
        result.message = messages.userDoesNotExist;
        return res.status(404).send(result);
      } else if (user && user != null) {
        const isValidOldPassword = await bcrypt.compare(
          req.body.password,
          user.password
        );
        if (!isValidOldPassword) {
          result.isError = true;
          result.message = messages.userDoesNotExist;
          return res.status(404).send(result);
        }
      }
    } else {
      result.isError = true;
      result.message = messages.invalidPayload;
      return res.status(404).send(result);
    }
    next();
  } catch (error) {
    result.isError = true;
    result.message = messages.error;
    return res.status(404).send(result);
  }
};

const isUserSessionAuthenticated = async (req, res, next) => {
  try {
    if (
      req.session.isAuth &&
      req.session.userId &&
      req.headers.sessionid === req.session.userId
    ) {
      const user = await userAccount.findOne({
        _id: req.session.userId,
      });
      if (user && user != null) {
        next();
      }
    } else {
      req.session.error = messages.sessionError;
      result.isError = true;
      result.message = messages.sessionError;
      res.status(404).send(result);
    }
  } catch (err) {
    result.isError = true;
    result.message = messages.error;
    return res.status(404).send(result);
  }
};

const isGoogleAuthenticated = async (req, res, next) => {
  try {
    if (req.body?.email) {
      const user = await userAccount.findOne({
        email: req.body.email,
      });

      if (!user || user == null) {
        await loginController.registerWithGoogle(req);
      }
      next();
    } else {
      result.isError = true;
      result.message = messages.invalidPayload;
      return res.status(404).send(result);
    }
  } catch (error) {
    result.isError = true;
    result.message = messages.error;
    return res.status(404).send(result);
  }
};

const isUserExist = async (req, res, next) => {
  try {
    if (req.body?.email) {
      const user = await userAccount.findOne({
        email: req.body.email,
      });

      if (!user && user == null) {
        result.isError = true;
        result.message = messages.userDoesNotExist;
        return res.status(404).send(result);
      }
    } else {
      result.isError = true;
      result.message = messages.invalidPayload;
      return res.status(404).send(result);
    }
    next();
  } catch (error) {
    result.isError = true;
    result.message = messages.error;
    return res.status(404).send(result);
  }
};

const isTokenValid = async (req, res, next) => {
  var tokenInvalid = false;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[2];
  if (!token && token == null) {
    result.isError = true;
    result.message = messages.userDoesNotExist;
    return res.status(404).send(result);
  } else {
    jwtwebtoken.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      (error, user) => {
        if (error) {
          result.isError = true;
          result.message = messages.jwtTokeExpired;
          return res.status(200).send({ result });
        } else {
          req.user = user;
          next();
        }
      }
    );
  }
};

const isRestPaswordTokenValid = async (req, res, next) => {
  if (!req.params.token) {
    result.isError = true;
    result.message = messages.tokenProvideMessage;
    return res.status(404).send(result);
  }

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  //Checking the token expiration....
  const userData = await usersPaswords.findOne({
    token: resetPasswordToken,
    tokenExpire: { $gt: Date.now() },
  });

  if (!userData && userData == null) {
    result.isError = true;
    result.message = messages.tokeExpired;
    return res.status(404).send(result);
  }
  next();
};

const isRoleExist = async (req, res, next) => {
  if (userRoles[req.body.userole] == null) {
    result.isError = true;
    result.message = messages.roleNotExist;
    return res.status(404).send(result);
  }
  next();
};

const isUserHaveRole = async (req, res, next) => {
  try {
    if (req.body?.email) {
      req.body.email = req.body.email.toLowerCase();

      const user = await userAccount.findOne({
        email: req.body.email,
      });
      if (
        user &&
        user != null &&
        user.roles.includes(userRoles[req.body.userole])
      ) {
        result.isError = true;
        result.message = messages.userHaveRole;
        return res.status(404).send(result);
      }
    } else {
      result.isError = true;
      result.message = messages.invalidPayload;
      return res.status(404).send(result);
    }
    next();
  } catch (error) {
    result.isError = true;
    result.message = messages.error;
    return res.status(404).send(result);
  }
};

const isUserHaveRights = async (req, res, next) => {
  try {
    if (req.headers?.sessionid) {
      const user = await userAccount.findOne({
        _id: req.headers.sessionid,
      });
      if (
        user &&
        user != null &&
        (user.roles.includes(userRoles[admin] == false) ||
          user.roles.includes(userRoles[superAdmin] == false))
      ) {
        result.isError = true;
        result.message = messages.userNotHaveRights;
        return res.status(404).send(result);
      }
    } else {
      result.isError = true;
      result.message = messages.invalidPayload;
      return res.status(404).send(result);
    }
    next();
  } catch (error) {
    result.isError = true;
    result.message = error.message;
    return res.status(404).send(result);
  }
};

const isNFTDataValid = async (req, res, next) => {
  try {
    if (req.body?.name && req.body?.description && req?.file) {
      next();
    } else {
      result.isError = true;
      result.message = messages.invalidPayload;
      return res.status(404).send(result);
    }
  } catch (error) {
    result.isError = true;
    result.message = error.message;
    return res.status(404).send(result);
  }
};

const isSaleListDataValid = async (req, res, next) => {
  try {
    if (req.body?.tokenId && req.body?.price) {
      next();
    } else {
      result.isError = true;
      result.message = messages.invalidPayload;
      return res.status(404).send(result);
    }
  } catch (error) {
    result.isError = true;
    result.message = error.message;
    return res.status(404).send(result);
  }
};

const isSaleUnListDataValid = async (req, res, next) => {
  try {
    if (req.body?.tokenId) {
      next();
    } else {
      result.isError = true;
      result.message = messages.invalidPayload;
      return res.status(404).send(result);
    }
  } catch (error) {
    result.isError = true;
    result.message = error.message;
    return res.status(404).send(result);
  }
};
const isUpdatelistNFTPriceValid = async (req, res, next) => {
  try {
    if (req.body?.price) {
      next();
    } else {
      result.isError = true;
      result.message = messages.invalidPayload;
      return res.status(404).send(result);
    }
  } catch (error) {
    result.isError = true;
    result.message = error.message;
    return res.status(404).send(result);
  }
};

const isMarketOrRoyalityValid = async (req, res, next) => {
  try {
    if (req.body?.value) {
      next();
    } else {
      result.isError = true;
      result.message = messages.invalidPayload;
      return res.status(404).send(result);
    }
  } catch (error) {
    result.isError = true;
    result.message = error.message;
    return res.status(404).send(result);
  }
};

module.exports = {
  isRegistered,
  isAuthenticated,
  isGoogleAuthenticated,
  isUserExist,
  isTokenValid,
  isEmailIsValid,
  isRestPaswordTokenValid,
  isUserHaveRole,
  isRoleExist,
  isUserHaveRights,
  uploadedToIpfc,
  upload,
  isUserSessionAuthenticated,
  isNFTDataValid,
  isSaleListDataValid,
  isSaleUnListDataValid,
  isUpdatelistNFTPriceValid,
  isMarketOrRoyalityValid,
};
