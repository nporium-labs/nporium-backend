const mongoose = require("mongoose"),
  userAccount = mongoose.model("userAccount"),
  usersPaswords = mongoose.model("usersPasword"),
  bcrypt = require("bcryptjs"),
  crypto = require("crypto"),
  sgMail = require("@sendgrid/mail"),
  jwtwebtoken = require("jsonwebtoken"),
  result = require("../response/result"),
  loginResult = require("../response/loginResponse"),
  userResult = require("../response/userResponse"),
  messages = require("../utilities/errormessages");
// require("dotenv").config();

// accessTokens for generating jwt
const ACCESS_TOKEN_SECRET =
  "d20be3df62802301c5969cf876fac9a70c41bf217f30956bc85adc7249d122b9d80e07f69dba640e57f273d5b84372fea51eeefd4f88d154f9d09f576358fd1b";
const REFRESH_TOKEN_SECRET =
  "82b1f980cf7d62ddd73a9ab619f682a7945cf2886440fd7668f33b9b06d475514238df9b4b40cc2b55abab671ff1f83ee83dd53201b4004726a1c1eba49d55ff";
sgMail.setApiKey(
  "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"
);
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
    firstName: req.body.name,
    lastName: req.body.family_name,
    imageUrl: req.body.picture,
    password: req.body.sub,
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
      name: userData.firstName,
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

const forgetPassword = async (req, res) => {
  const userData = await userAccount.findOne({
    email: req.body.email,
  });
  if (userData && userData != null) {
    const token = await getResetPasswordToken();
    const resetUrl = `https://nft-store-frontend-lzmqn7y6k-danishismail.vercel.app/forgot/${token.resetToken}`;
    const message = `
        <h1>Hi,${userData.firstName}</h1>
        <p>you are recieving this email because  (you or someone else) has reuqested the reset of the password.</p>
        <p>Please click this link to reset your password</p><a href=${resetUrl}>${resetUrl}</a><br><br> 
        <p>if you did'nt request reset password,please ignore this email or reply us to let us know.This password reset
        is only valid for next 30 minutes.</p> <br>
        <p>Thanks</p>
        <h2>nporium</h2>
        <p>Contact us through email: nporium@gmail.com</p>
    `;
    const msg = {
      to: req.body.email, // recipient
      from: "", // Change to your verified sender
      subject: "RESET PASSWORD",
      html: message,
    };
    try {
      sgMail.send(msg).then(() => {
        // console.log("Email sent");
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
      result.message = messages.forgetPasswordError;
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
    user.password = req.body.password;
    const data = await user.save();
    const response = await usersPaswords.deleteOne({ email: userData.email });
    result.isError = false;
    result.message = messages.updatePasswordMessage;
    return res.send({ result });
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
};
