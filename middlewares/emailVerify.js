const path = require("path");
const async = require(path.join(__dirname, "asyncHandler"));
const sendPassword = require(path.join(__dirname, 'passwordSent'))
const User = require(path.join(__dirname, "..", "models", "Users"));

exports.verifyEmail = async(async (req, res, next) => {
  const { email } = req.body
  const token = req.params.token;
  if (token === "undefined" || token.length > 36 || token.length < 36) {
    console.log(token);
    return res.status(400).json({
      success: false,
      error: `You're not authorized to visit this page`
    });
  } else {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(406).json({
          success: false,
          error: `You're not authorized to visit this page`
        });
      } else {
        if (user.secretToken !== token) {
          return res.json({ error: "No Valid Token Exists with this Email" });
        } else {
          user.secretToken = "";
          user.isVerified = true;
          await user.save();
          sendPassword(email, user.passwordToken)
          return res.json({
            success: "true",
            message: "Email Verified. You can now login."
          });
        }
      }
  }
  // Email verification client
  // if(url == '/client/'){
  //   try {
  //       const user = await User.findOne({ email: req.body.email });
  //       if (!user) {
  //         return res.json({ error: "Invalid Credentials" });
  //       } else {
  //         if (user.secretToken !== token) {
  //           return res.json({ error: "No Valid Token Exists with this Email" });
  //         } else {
  //           user.secretToken = "";
  //           user.isVerified = true;
  //           await user.save();
  //           res.json({ message: "Email Verified. You can now login." });
  //         }
  //       }
  //     } catch (error) {
  //       next(error);
  //     }
  // }

  // Email verification vendor
  // if (url === "/vendor/") {
  //   try {
  //     const user = await Vendor.findOne({ email: req.body.email });
  //     if (!user) {
  //       return res.json({ error: "Invalid Credentials" });
  //     } else {
  //       if (user.secretToken !== token) {
  //         return res.json({ error: "No Valid Token Exists with this Email" });
  //       } else {
  //         user.secretToken = "";
  //         user.isVerified = true;
  //         await user.save();
  //         res.json({ message: "Email Verified. You can now login." });
  //       }
  //     }
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // // Email verification admin
  // if (url === "/admin/") {
  //   try {
  //     const user = await Admin.findOne({ email: req.body.email });
  //     if (!user) {
  //       return res.json({ error: "Invalid Credentials" });
  //     } else {
  //       if (user.secretToken !== token) {
  //         return res.json({ error: "No Valid Token Exists with this Email" });
  //       } else {
  //         user.secretToken = "";
  //         user.isVerified = true;
  //         await user.save();
  //         res.json({ message: "Email Verified. You can now login." });
  //       }
  //     }
  //   } catch (error) {
  //     next(error);
  //   }
  // }
});
