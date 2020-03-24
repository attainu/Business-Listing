// Loading Modules
const [path, Joi, uniqid, jwt] = [
  require("path"),
  require("@hapi/joi"),
  require("uniqid"),
  require("jsonwebtoken")
];
const uuid = require("uuid/v4");

// Destructuring Modules
const { hash, compare } = require("bcryptjs");
const { sign, verify } = jwt;

// Importing Mail routes
const registerMail = require(path.join(
  __dirname,
  "..",
  "email",
  "registrationMail"
));

// Mongoose Schema
const User = require(path.join(__dirname, "..", "models", "clientAccountDB"));

// Register controllers

// Get Route (register)
exports.getRegister = (req, res, next) => {
  res.json({ message: "Welcome to register" });
};

// Post Route (register)
exports.postRegister = async (req, res, next) => {
  try {
    // Storing user Fields in Variables
    const { username, email, confirmEmail, mobileNumber } = req.body;

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
      mobileNumber: Joi.number().required()
    });
    const { error, result } = schema.validate({
      username: username,
      email: email,
      confirmEmail: confirmEmail,
      mobileNumber: mobileNumber
    });
    if (error) {
      return res.json({ message: error.message });
    } else {
      const secretToken = uuid();
      const passwordid = uniqid();
      const passwordToken = passwordid;
      const password = await hash(passwordid, 10);
      const token = await sign({ id: uuid() }, "sriksha", {
        expiresIn: 1000 * 60 * 60
      });
      const user = new User({
        username,
        email,
        passwordToken,
        password,
        mobileNumber,
        token: token,
        secretToken: secretToken,
        isVerified: false
      });
      await user.save();
      registerMail(email, secretToken);
      // registerMail(email, secretToken)
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
          expiresIn: 1000 * 60 * 60
        });
        console.log(user.token)
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
    let founduser = req.user;
    let user = await User.findOne({ email : founduser.email });
    user.token = ''
    console.log(user.token)
    await user.save();
    return res.json({ message: "Logged out Successfull" });
  } catch (error) {
    next(error);
  }
};
