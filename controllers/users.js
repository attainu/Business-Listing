// Loading Modules
const [path, Joi, uniqid, jwt, stringSimilarity, dotenv, uuid] = [
  require("path"),
  require("@hapi/joi"),
  require("uniqid"),
  require("jsonwebtoken"),
  require("string-similarity"),
  require("dotenv").config(),
  require("uuid/v4")
];
const [async, passwordReset] = [
  require(path.join(__dirname, "..", "middlewares", "asyncHandler")),
  require(path.join(__dirname, "..", "middlewares", "passwordReset"))
];

// Destructuring Modules
const { hash, compare } = require("bcryptjs");
const { sign, verify } = jwt;

// Importing Mail routes
const registerMail = require(path.join(
  __dirname,
  "..",
  "middlewares",
  "registrationMailClient"
));

// Mongoose Schema
const User = require(path.join(__dirname, "..", "models", "Users"));
// Post Route (register)
exports.Register = async(async (req, res, next) => {
  // Storing user Fields in Variables
  const { username, email, confirmEmail, mobileNumber, role } = req.body;

  // Validating Fields
  const schema = Joi.object({
    username: Joi.string()
      .min(3)
      .max(25)
      .required()
      .alphanum(),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] }
    }),
    confirmEmail: Joi.ref("email"),
    mobileNumber: Joi.number().required(),
    role: Joi.string()
      .max(10)
      .min(3)
      .required()
  });
  const { error, result } = schema.validate({
    username: username,
    email: email,
    confirmEmail: confirmEmail,
    mobileNumber: mobileNumber,
    role: role
  });
  if (error) {
    return res.status(400).json({ message: error.message });
  } else {
    const secretToken = uuid();
    // const passwordid = uniqid();
    const passwordToken = uniqid();
    const hash = await hash(passwordToken, 10);
    // const password = await hash(passwordid, 10);
    const user = new User({
      username,
      email,
      passwordToken,
      mobileNumber,
      role,
      password: hash,
      secretToken: secretToken
    });
    await user.save();
    registerMail(email, secretToken);
    storecookie(user, 200, res);
  }
});

// Post Route (login)
exports.Login = async(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || email === "" || email === "undefined" || email.length < 1) {
    return res.status(400).json({ success: false, error: `Email is required` });
  } else if (
    !password ||
    password === "" ||
    password === "undefined" ||
    password.length < 1
  ) {
    return res
      .status(400)
      .json({ success: false, error: `Password is required` });
  } else if (!role || role === "" || role === "undefined" || role.length < 1) {
    return res.status(400).json({ success: false, error: `role is  required` });
  } else {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(406)
        .json({ success: false, error: `Invalid Email Id` });
    } else {
      const isMatched = await compare(password, user.password);
      if (!isMatched) {
        return res
          .status(406)
          .json({ success: false, error: `Invalid Email || Password` });
      } else {
        if (user.role !== role) {
          return res.status(406).json({
            success: false,
            error: `No valid user found with role. ${user.role}`
          });
        } else {
          storecookie(user, 200, res);
        }
      }
    }
  }
});
// Logout Route
exports.Logout = async(async (req, res, next) => {
  const user = req.user;
  let token = await User.findOne({ token: user.token });
  token.token = "";
  await token.save();
  return res.json({ message: "Logged out Successfull" });
});

// Storing jwt token in cookie
const storecookie = (user, status, res) => {
  const token = user.signJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRE_COOKIE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(status)
    .cookie("token", token, options)
    .json({ success: true, token });
};

// getting logged in user
exports.Me = async(async (req, res, next) => {
  let user = await User.findById(req.user);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: `No valid resource found with requested token ${req.user}`
    });
  } else {
    return res.status(200).json({ success: true, data: user });
  }
});

// forgot password sent mail
exports.forgotPassword = async(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(401)
      .json({ success: false, error: `No valid user found with this email` });
  const token = uniqid();
  user.passwordToken = token;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  res.json(user);
  try {
    passwordReset(email, token);
    return res
      .status(403)
      .status({ success: true, error: "Email sent with password reset link." });
  } catch (err) {
    user.passwordToken = undefined;
    return res.status(403).status({ success: false, error: "Email sent fail" });
  }
});

// verify forgot password token
exports.verifyForgotPasswordToken = async(async (req, res, next) => {
  const token = req.params.id;
  const user = await User.findOne({ passwordToken: token });
  if (!user)
    return res.status(406).json({
      success: false,
      error: `No valid user found with this token ${token}`
    });
  const { password, confirmpassword } = req.body;
  const schema = Joi.object({
    password: Joi.string()
      .min(8)
      .max(15)
      .required(),
    confirmpassword: Joi.ref("password")
  });
  const { error, result } = schema.validate({
    password: password,
    confirmpassword: confirmpassword
  });
  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
  const pass = await hash(password, 10);
  user.passwordToken = null
  user.password = pass;
  await user.save({ validateBeforeSave: true });
  return res
    .status(200)
    .json({ success: true, message: `Password changed successfully` });
});
// Modify password
exports.modifyPassword = async(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res
      .status(401)
      .json({ success: false, error: `No valid user found.` });
  }
  const { password, newPassword, newConfirmPassword } = req.body;
  if (!password || !newPassword || !newConfirmPassword)
    return res
      .status(406)
      .json({ success: false, error: `password fileds can't be empty.` });
  const verified = await compare(password, req.user.password);

  if (!verified) {
    return res
      .status(406)
      .json({ success: false, error: `old password doesn't match.` });
  }
  const schema = Joi.object({
    newPassword: Joi.string()
      .required()
      .min(8)
      .max(15),
    newConfirmPassword: Joi.ref("newPassword")
  });
  const { error, result } = schema.validate({
    newPassword: newPassword,
    newConfirmPassword: newConfirmPassword
  });
  if (error)
    return res.status(400).json({ success: false, error: error.message });
  const hashed = await hash(newPassword, 10);
  await User.findByIdAndUpdate(
    req.user.id,
    { $set: { password: hashed,passwordToken : null } },
    { new: true, runvalidators: true }
  );
  res
    .status(200)
    .json({ success: false, message: `Password changed successfully.` });
});

// reset password
exports.resetPassword = async(async (req, res, next) => {});
