const userRegistered = "User resgister successfully";
const userDoesNotExist = "User does not exist";
const userEmailNotValid = "User email is not valid";
const userExist = "User already exist exist";
const emailNotSend = "Could not send the email";
const loginsuccess = "login successfully";
const resgisterError = "There is an issue in register user";
const forgetPasswordMessage =
  "Reset password link send to you email Please check your email";
const forgetPasswordError =
  "There is an error while sending the email on given address! Please try again later";
const updatePasswordMessage = "Pasword updated successfully";
const getUserMessage = "User data find successfully";
const resetTokenIsNotValid =
  "Reset Token is not valid please try again later with new reset password link";
const tokenProvideMessage = "Please provide token";
const tokeExpired =
  "This password reset token is invalid, Token expired! Please request for new link";
const userHaveRole = "User have already this role";
const userNotHaveRole = "User does not have this role";
const userRoleUpdated = "User role is updated successfully";
const roleNotExist = "Plesae provide valid role";
const jwtTokeExpired = "Invalid token, Token expired! Please login again";
const userNotHaveRights = "You dont have rights";
const invalidPayload = "Please provide valid payload";
const accountNotApproved =
  "There is an error while sending email please contact admin";
const passwordResetTokenInvalid = "This password reset token is invalid";

module.exports = {
  userRegistered,
  userDoesNotExist,
  userExist,
  loginsuccess,
  resgisterError,
  forgetPasswordMessage,
  getUserMessage,
  updatePasswordMessage,
  emailNotSend,
  userEmailNotValid,
  forgetPasswordError,
  resetTokenIsNotValid,
  tokenProvideMessage,
  tokeExpired,
  userHaveRole,
  userNotHaveRole,
  userRoleUpdated,
  jwtTokeExpired,
  roleNotExist,
  userNotHaveRights,
  invalidPayload,
  accountNotApproved,
  passwordResetTokenInvalid,
};
