const mongoose = require("mongoose"),
  userAccount = mongoose.model("userAccount"),
  usersPaswords = mongoose.model("usersPasword"),
  crypto = require("crypto"),
  bcrypt = require("bcryptjs"),
  { body, validationResult } = require("express-validator"),
  loginController = require("../controller/loginController"),
  jwtwebtoken = require("jsonwebtoken"),
  result = require("../response/result"),
  messages = require("../utilities/errormessages");
require("dotenv").config();

const isRegistered = async (req, res, next) => {
  if (req.body.email) {
    req.body.email = req.body.email.toLowerCase();
  }

  const user = await userAccount.findOne({
    email: req.body.email,
  });
  if (user && user != null) {
    result.isError = true;
    result.message = messages.userExist;
    return res.status(404).send(result);
  }
  next();
};

const isAuthenticated = async (req, res, next) => {
  const user = await userAccount.findOne({
    email: req.body.email,
    password: req.body.password,
  });
  if (!user && user == null) {
    result.isError = true;
    result.message = messages.userDoesNotExist;
    return res.status(404).send(result);
  }
  next();
};

const isGoogleAuthenticated = async (req, res, next) => {
  const user = await userAccount.findOne({
    email: req.body.email,
  });

  if (!user || user == null) {
    await loginController.registerWithGoogle(req, res, next);
  }
  next();
};

const isUserExist = async (req, res, next) => {
  const user = await userAccount.findOne({
    email: req.body.email,
  });
  if (!user && user == null) {
    result.isError = true;
    result.message = messages.userDoesNotExist;
    return res.status(404).send(result);
  }
  next();
};

const isTokenValid = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
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
          return res.status(403).send("token not valid");
        } else {
          req.user = user;
        }
      }
    );
  }
  next();
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

module.exports = {
  isRegistered,
  isAuthenticated,
  isGoogleAuthenticated,
  isUserExist,
  isTokenValid,
  isRestPaswordTokenValid,
};
