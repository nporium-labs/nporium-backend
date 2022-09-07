const mongoose = require("mongoose"),
  userAccount = mongoose.model("userAccount"),
  usersPaswords = mongoose.model("usersPasword"),
  postmark = require("postmark"),
  FormData = require("form-data"),
  bcrypt = require("bcryptjs"),
  crypto = require("crypto"),
  sgMail = require("@sendgrid/mail"),
  jwtwebtoken = require("jsonwebtoken"),
  result = require("../response/result"),
  uploadData = require("../utilities/loginHelper"),
  loginResult = require("../response/loginResponse"),
  userResult = require("../response/userResponse"),
  messages = require("../utilities/errormessages");

require("dotenv").config();

const signup = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const user = {
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      imageUrl: req.body.imageUrl,
      password: hashedPass,
      isActive: true,
    };

    const response = await userAccount.create(user);
    result.isError = false;
    result.message = messages.userRegistered;
    res.send(result);
  } catch (error) {
    result.isError = true;
    result.message = error.message;
    res.send(result);
  }
};

const login = async (req, res) => {
  const userData = await userAccount
    .findOne({
      email: req.body.email,
    })
    .select({ firstName: 1, lastName: 1, email: 1, roles: 1 });
  if (userData && userData != null) {
    loginResult.isError = false;
    loginResult.message = messages.loginsuccess;
    loginResult.userName = userData.firstName;
    loginResult.email = userData.email;
    loginResult.role = userData.roles[0];
    req.session.isAuth = true;
    req.session.userId = userData._id;
    res.set("sessionId", req.session.userId);
    return res.send({ loginResult });
  }
};

const registerWithGoogle = async (req) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(req.body.sub, salt);
  const user = {
    email: req.body.email,
    firstName: req.body.name,
    lastName: req.body.family_name,
    imageUrl: req.body.picture,
    password: hashedPass,
    isActive: true,
  };

  await userAccount.create(user);
};

const loginWithGoogle = async (req, res) => {
  try {
    const userData = await userAccount
      .findOne({
        email: req.body.email,
      })
      .select({ firstName: 1, lastName: 1, email: 1, roles: 1 });
    if (userData && userData != null) {
      loginResult.isError = false;
      loginResult.message = messages.loginsuccess;
      loginResult.userName = userData.firstName;
      loginResult.email = userData.email;
      loginResult.role = userData.roles[0];
      req.session.isAuth = true;
      req.session.userId = userData._id;
      res.set("sessionId", req.session.userId);
    }
    res.status(200).send({ loginResult });
  } catch (error) {
    loginResult.isError = true;
    loginResult.message = error.message;
  }
};

const getResetPasswordToken = async (req, res) => {
  //Create Token......
  const resetToken = crypto.randomBytes(20).toString("hex");

  //HASH THE TOKEN...
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const resetTokenExpire = Date.now() + 30 * 60 * 1000; //30 Minutes Expiration time......

  return { resetToken, resetPasswordToken, resetTokenExpire };
};

const refreshToken = async (req, res) => {
  const userData = await userAccount
    .findOne({
      email: req.body.email,
    })
    .select({ firstName: 1, lastName: 1, email: 1, roles: 1 });
  if (userData && userData != null) {
    let user = {
      name: userData.firstName,
      email: userData.email,
      roles: userData.roles,
    };
    const accessToken = jwtwebtoken.sign(
      user,
      procces.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "60m",
      }
    );
    loginResult.isError = false;
    loginResult.message = messages.loginsuccess;
    loginResult.userName = userData.firstName;
    loginResult.email = userData.email;
    loginResult.token = accessToken;
    return res.send({ loginResult });
  }
};

const forgetPassword = async (req, res) => {
  const userData = await userAccount.findOne({
    email: req.body.email,
  });
  if (userData && userData != null) {
    var client = new postmark.ServerClient(process.env.SERVER_API_TOKEN);
    const token = await getResetPasswordToken();
    const resetUrl = `https://nft-store-frontend-lzmqn7y6k-danishismail.vercel.app/forgot/${token.resetToken}`;
    const message = `
        <h1>Hi,${userData.firstName}</h1>
        <p>you are recieving this email because  (you or someone else) has reuqested the reset of the password.</p>
        <p>Please click this link to reset your password</p><a href=${resetUrl}>${resetUrl}</a><br><br> 
        <p>if you did'nt request reset password,please ignore this email or reply us to let us know.This password reset
        is only valid for next 30 minutes.</p> <br>
        <p>Thanks</p>
        <h2>Nporium Team </h2>
        <p>Contact us through email: nporium@gmail.com</p>
    `;

    try {
      await client.sendEmail({
        From: "sender@example.com",
        To: req.body.email,
        Subject: "RESET PASSWORD",
        HtmlBody: message,
      });

      const usersPasword = new usersPaswords({
        email: req.body.email,
        token: token.resetPasswordToken,
        tokenExpire: token.resetTokenExpire,
      });
      const response = await usersPasword.save();
      result.isError = false;
      result.message = messages.forgetPasswordMessage;
    } catch (err) {
      result.isError = true;
      result.message = messages.accountNotApproved;
    }
    return res.send({ result });
  }
};

const updateNewPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const userData = await usersPaswords
    .findOne({
      token: resetPasswordToken,
    })
    .select({ email: 1 });
  if (userData && userData != null) {
    const user = await userAccount
      .findOne({
        email: userData.email,
      })
      .select({ email: 1, password: 1 });
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    user.password = hashedPass;
    const data = await user.save();
    const response = await usersPaswords.deleteOne({ email: userData.email });
    result.isError = false;
    result.message = messages.updatePasswordMessage;
    return res.send({ result });
  }
};

const setNewRole = async (req, res) => {
  const userData = await userAccount
    .findOne({
      email: req.body.email,
    })
    .select({ firstName: 1, lastName: 1, email: 1, roles: 1 });
  result.isError = false;
  result.message = messages.userRoleUpdated;
  return res.send(result);
};

const logOut = async (req, res) => {
  try {
    if (
      req.session.isAuth &&
      req.session.userId &&
      req.headers.sessionid === req.session.userId
    ) {
      req.session.destroy();
      result.isError = false;
      result.message = messages.logOutSuccess;
      res.status(200).send(result);
    } else {
      result.isError = true;
      result.message = messages.logOutError;
      res.status(400).send(result);
    }
  } catch (error) {
    // console.log("error", error.message);
    result.isError = true;
    result.message = error.message;
    res.status(400).send(result);
  }
};

const getAllUsers = async (req, res) => {
  let userData = await userAccount.find();
  return res.send(userData);
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

const getHello = async (req, res) => {
  return res.send("hello");
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
  updateNewPassword,
  getResetPasswordToken,
  setNewRole,
  refreshToken,
  logOut,
};
