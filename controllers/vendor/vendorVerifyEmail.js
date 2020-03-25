const path = require("path");
const User = require(path.join(__dirname, "..","..", "models", "vendorAccountDB"));

// Importing Email routes
const passwordSent = require(path.join(
  __dirname,
  "..",
  "..",
  "email",
  "passwordSent"
));

exports.verifyEmail = async (req, res, next) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ error: "Invalid Credentials" });
    } else {
      if (user.secretToken !== token) {
        return res.json({ error: "No Valid Token Exists with this Email" });
      } else {
        user.secretToken = "";
        user.isVerified = true;
        await user.save();
        passwordSent(user.email, user.passwordToken)
        res.json({ message: "Email Verified. We'll get back to you when your account is approved." });
      }
    }
  } catch (error) {
    next(error);
  }
};
