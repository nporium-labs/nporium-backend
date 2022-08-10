const mongoose = require("mongoose"),
  userAccount = mongoose.model("userAccount"),
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

module.exports = {
  isRegistered,
  isAuthenticated,
  isGoogleAuthenticated,
  isUserExist,
  isTokenValid,
};
