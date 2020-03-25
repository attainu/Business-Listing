const path = require("path");
const Admin = require(path.join(
  __dirname,
  "..",
  "..",
  "models",
  "adminAccountDB"
));
const Vendor = require(path.join(
  __dirname,
  "..",
  "..",
  "models",
  "vendorAccountDB"
));
const User = require(path.join(
  __dirname,
  "..",
  "..",
  "models",
  "clientAccountDB"
));

exports.verifyEmail = async (req, res, next) => {
  const token = req.params.token;

  const url = req.url.replace(req.params.token, '')
  // Email verification client
  if(url == '/client/'){
    try {
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
            res.json({ message: "Email Verified. You can now login." });
          }
        }
      } catch (error) {
        next(error);
      }
  }

  // Email verification vendor
  if(url === '/vendor/'){
    try {
        const user = await Vendor.findOne({ email: req.body.email });
        if (!user) {
          return res.json({ error: "Invalid Credentials" });
        } else {
          if (user.secretToken !== token) {
            return res.json({ error: "No Valid Token Exists with this Email" });
          } else {
            user.secretToken = "";
            user.isVerified = true;
            await user.save();
            res.json({ message: "Email Verified. You can now login." });
          }
        }
      } catch (error) {
        next(error);
      }
  }

  // Email verification admin
  if(url === '/admin/'){
    try {
        const user = await Admin.findOne({ email: req.body.email });
        if (!user) {
          return res.json({ error: "Invalid Credentials" });
        } else {
          if (user.secretToken !== token) {
            return res.json({ error: "No Valid Token Exists with this Email" });
          } else {
            user.secretToken = "";
            user.isVerified = true;
            await user.save();
            res.json({ message: "Email Verified. You can now login." });
          }
        }
      } catch (error) {
        next(error);
      }
  }
};
