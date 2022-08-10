const mongoose = require("mongoose"),
  userAccount = mongoose.model("userAccount"),
  jwtwebtoken = require("jsonwebtoken"),
  result = require("../response/result"),
  loginResult = require("../response/loginResponse"),
  userResult = require("../response/userResponse"),
  messages = require("../utilities/errormessages");
// require("dotenv").config();

const signup = async (req, res) => {
  const user = new userAccount({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    imageUrl: req.body.imageUrl,
    password: req.body.password,
    isActive: true,
  });

  const response = await user.save();
  result.isError = false;
  result.message = messages.userRegistered;
  return res.send(result);
};

const getHello = async (req, res) => {
  return res.send("hello");
};
const login = async (req, res) => {
  const userData = await userAccount
    .findOne({
      email: req.body.email,
      password: req.body.password,
    })
    .select({ firstName: 1, lastName: 1, email: 1 });

  if (userData && userData != null) {
    let user = {
      name: userData.firstName + userData.lastName,
      email: userData.email,
    };
    const accessToken = jwtwebtoken.sign(user, ACCESS_TOKEN_SECRET);
    loginResult.isError = false;
    loginResult.message = messages.loginsuccess;
    loginResult.userName = userData.firstName + " " + userData.lastName;
    loginResult.email = userData.email;
    loginResult.token = accessToken;
    return res.send({ loginResult });
  }
};

const registerWithGoogle = async (req, res, next) => {
  const user = new userAccount({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    imageUrl: req.body.imageUrl,
    password: req.body.password,
    isActive: true,
  });

  await user.save();
  next();
};

const loginWithGoogle = async (req, res) => {
  const userData = await userAccount
    .findOne({
      email: req.body.email,
    })
    .select({ firstName: 1, lastName: 1, email: 1 });

  if (userData && userData != null) {
    let user = {
      name: userData.firstName + userData.lastName,
      email: userData.email,
    };
    const accessToken = jwtwebtoken.sign(user, ACCESS_TOKEN_SECRET);
    loginResult.isError = false;
    loginResult.message = messages.loginsuccess;
    loginResult.userName = userData.firstName + " " + userData.lastName;
    loginResult.email = userData.email;
    loginResult.token = accessToken;
    return res.send({ loginResult });
  }
};

const getUser = async (req, res) => {
  let userData = await userAccount
    .find({
      email: req.body.email,
    })
    .select({ firstName: 1, lastName: 1, email: 1, tags: 1 });
  userResult.isError = false;
  userResult.message = messages.getUserMessage;
  userResult.userName = userData.firstName + " " + userData.lastName;
  userResult.email = userData.email;
  return res.send(userResult);
};

const forgetPassword = async (req, res) => {
  const userData = await userAccount.findOne({
    email: req.body.email,
    password: req.body.password,
  });

  if (userData && userData != null) {
    userData.password = req.body.newPassword;
    const data = await userData.save();
    result.isError = false;
    result.message = messages.forgetPasswordMessage;
    return res.send({ result });
  }
};

module.exports = {
  signup,
  login,
  registerWithGoogle,
  loginWithGoogle,
  forgetPassword,
  getAllUsers,
  getUser,
  getHello,
};
