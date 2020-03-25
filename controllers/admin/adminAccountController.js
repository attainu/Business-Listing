// Loading Modules
const [path, Joi, uniqid] = [
  require("path"),
  require("@hapi/joi"),
  require("uniqid")
];
const uuid = require("uuid/v4");

// Destructuring Modules
const { hash, compare } = require("bcryptjs");
const { sign, verify } = require("jsonwebtoken");

// Importing Mail routes
const registerMail = require(path.join(
  __dirname,
  "..",
  "..",
  "email",
  "registrationMailAdmin"
));

// Mongoose Schema
const User = require(path.join(
  __dirname,
  "..",
  "..",
  "models",
  "adminAccountDB"
));

// Register controllers

// Get Route (register)
exports.getRegister = (req, res, next) => {
  res.json({ message: "Welcome to register" });
};

// Post Route (register)
exports.postRegister = async (req, res, next) => {
  try {
    // Storing user Fields in Variables
    const { username, email, confirmEmail, password, mobileNumber } = req.body;

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
      confirmEmail : Joi.ref('email'),
      password: Joi.string()
        .required()
        .min(3)
        .max(25),
        mobileNumber : Joi.string().required().min(10)
    });
    const { error, result } = schema.validate({
      username,
      email,
      password,
      confirmEmail,
      mobileNumber,
    });
    if (error) {
      return res.json({ message: error.message });
    } else {
      const hashed = await hash(password, 10);
      const token = await sign({ id: uuid() }, "sriksha", {
        expiresIn: 1000 * 60 * 60
      });
      const secretToken = uuid()
      const user = new User({
        username,
        email,
        token,
        secretToken,
        isVerified : false,
        mobileNumber,
        password: hashed
      });
      await user.save();
      registerMail(email, secretToken)
      res.json({ message: "Registered Successfully" });
    }
  } catch (error) {
    next(error);
  }
};

// Login Controllers

// Get Route (login)
exports.getLogin = (req, res, next) => {
  res.json({ message: "Welcome to Login" });
};

// Post Route (login)
exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      const passwordverify = await compare(password, user.password);
      if (!passwordverify) {
        return res.json({ error: "Email or password Doesn't match" });
      } else {
        user.token = await sign({ _id: user._id }, "sriksha", {
          expiresIn: 60 * 60
        });
        console.log(user.token);
        await user.save();
        return res.json({ message: `Login Successfull` });
      }
    } else {
      return res.json({ error: "Invalid Email" });
    }
  } catch (error) {
    next(error);
  }
};

// Logout Route
exports.DeleteLogout = async (req, res, next) => {
  try {
    const user = req.user;
    let token = await User.findOne({ token : user.token });
    token.token = "";
    await token.save();
    return res.json({ message: "Logged out Successfull" });
  } catch (error) {
    next(error);
  }
};
