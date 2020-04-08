// Loading Modules
const [path, Joi, uniqid, jwt, stringSimilarity, dotenv, uuid] = [
  require("path"),
  require("@hapi/joi"),
  require("uniqid"),
  require("jsonwebtoken"),
  require("string-similarity"),
  require("dotenv").config(),
  require("uuid/v4"),
];
const [async, passwordReset] = [
  require(path.join(__dirname, "..", "middlewares", "asyncHandler")),
  require(path.join(__dirname, "..", "middlewares", "passwordReset")),
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
const [User, Businesslist, Order] = [
  require(path.join(__dirname, "..", "models", "Users")),
  require(path.join(__dirname, "..", "models", "BusinessLists")),
  require(path.join(__dirname, "..", "models", "Orders")),
];
// Post Route (register)
exports.Register = async(async (req, res, next) => {
  // Storing user Fields in Variables
  const { username, email, confirmEmail, mobileNumber, role } = req.body;

  // Validating Fields
  const schema = Joi.object({
    username: Joi.string().min(3).max(25).required().alphanum(),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
    confirmEmail: Joi.ref("email"),
    mobileNumber: Joi.number().required(),
    role: Joi.string().max(10).min(3).required(),
  });
  const { error, result } = schema.validate({
    username: username,
    email: email,
    confirmEmail: confirmEmail,
    mobileNumber: mobileNumber,
    role: role,
  });
  if (error) {
    return res.status(400).json({ message: error.message });
  } else {
    const secretToken = uuid();
    // const passwordid = uniqid();
    const passwordToken = uniqid();
    const hashed = await hash(passwordToken, 10);
    // const password = await hash(passwordid, 10);
    const user = new User({
      username,
      email,
      passwordToken,
      mobileNumber,
      role,
      password: hashed,
      secretToken: secretToken,
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
            error: `No valid user found with role ${role}`,
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
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});
// Fetch all businesses
exports.getBusinessLists = async(async (req, res, next) => {
  let query;
  let reqQuery = { ...req.query };
  const removeFields = ["select", "sort", "limit", "page"];
  // filtering through query params using mongoose bitwise operators
  removeFields.forEach((params) => delete reqQuery[params]);
  let queryString = JSON.stringify(reqQuery);
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in)\b/,
    (match) => `$${match}`
  );
  query = Businesslist.find(JSON.parse(queryString)).populate("services");
  // Filtering through query params using select
  if (req.query.select) {
    let fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }
  // Filtering through query params using select
  if (req.query.sort) {
    let fields = req.query.sort.split(",").join(" ");
    query = query.sort(fields);
  } else {
    query = query.sort("-createdAt");
  }
  // Pagination
  const page = parseInt(req.query.page, 3) || 1;
  const limit = parseInt(req.query.limit, 3) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Businesslist.countDocuments();
  query = query.skip(startIndex).limit(limit);
  // Executing businessLists
  const businesslist = await query;
  // Pagination result
  const Pagination = {};
  if (endIndex < total) {
    Pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    Pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  const arr = [];
  for (let elem of businesslist) {
    if (elem.isAdminVerified === true) {
      arr.push(elem);
    }
  }
  if (arr.length > 0) {
    return res
      .status(200)
      .json({ success: true, count: arr.length, data: arr });
  } else {
    return res
      .status(404)
      .json({ success: false, count: arr.length, data: `Not Found.` });
  }
});
// Request vendor
exports.placeOrder = async(async (req, res, next) => {
  const user = req.user.id
  const vendor = req.params.id
  if (req.user.role !== "user") {
    return res
      .status(401)
      .json({ success: false, error: `You're not authorized to place order.` });
  }
  const vendors = await Businesslist.findById(vendor);
  if (!vendors) {
    return res
      .status(404)
      .json({
        success: false,
        error: `No valid resource found with id ${vendor}`,
      });
  }
  const { date, event, description, budget, location } = req.body;
  if (budget < vendor.price) {
    return res
      .status(406)
      .json({
        success: false,
        error: `Budget can't less than ${vendor.price}`,
      });
  } else {
    const schema = Joi.object({
      date: Joi.string().required(),
      event: Joi.string().required(),
      description: Joi.string().min(30).max(500).required(),
      budget: Joi.string().required(),
      location: Joi.string().required(),
    });
    const { error, result } = schema.validate({
      date: date,
      event: event,
      description: description,
      budget: budget,
      location: location,
    });
    if (error) {
      return res.status(406).json({ success: false, error: error.message });
    } else {
      const order = new Order({
        date,
        event,
        description,
        budget,
        location,
        vendorId: req.params.id,
        user
      });
      await order.save();
      return res
        .status(200)
        .json({
          success: true,
          message: "Order sent successfully. vendor will get back to you asap.",
          data: order,
        });
    }
  }
});
// getting logged in user
exports.Me = async(async (req, res, next) => {
  let user = await User.findById(req.user);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: `No valid resource found with requested token ${req.user}`,
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
  // res.json(user);
  try {
    passwordReset(email, token);
    return res
      .status(200)
      .json({
        success: true,
        message: "Email sent with password reset link.",
      });
  } catch (err) {
    user.passwordToken = undefined;
    return res.status(403).json({ success: false, error: "Email sent fail" });
  }
});

// verify forgot password token
exports.verifyForgotPasswordToken = async(async (req, res, next) => {
  const token = req.params.id;
  const user = await User.findOne({ passwordToken: token });
  if (!user)
    return res.status(406).json({
      success: false,
      error: `No valid user found with this token ${token}`,
    });
  const { password, confirmpassword } = req.body;
  const schema = Joi.object({
    password: Joi.string().min(8).max(15).required(),
    confirmpassword: Joi.ref("password"),
  });
  const { error, result } = schema.validate({
    password: password,
    confirmpassword: confirmpassword,
  });
  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
  const pass = await hash(password, 10);
  user.passwordToken = null;
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
    newPassword: Joi.string().required().min(8).max(15),
    newConfirmPassword: Joi.ref("newPassword"),
  });
  const { error, result } = schema.validate({
    newPassword: newPassword,
    newConfirmPassword: newConfirmPassword,
  });
  if (error)
    return res.status(400).json({ success: false, error: `New password and Confirm password doesn't match` });
  const hashed = await hash(newPassword, 10);
  await User.findByIdAndUpdate(
    req.user.id,
    { $set: { password: hashed, passwordToken: null } },
    { new: true, runvalidators: true }
  );
  res
    .status(200)
    .json({ success: false, message: `Password changed successfully.` });
});
// Storing jwt token in cookie
const storecookie = (user, status, res) => {
  const token = user.signJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRE_COOKIE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(status)
    .cookie("token", token, options)
    .json({ success: true, token });
};
