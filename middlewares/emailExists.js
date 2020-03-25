const path = require("path");
const User = require(path.join(__dirname, "..", "models", "clientAccountDB"));
const Vendor = require(path.join(__dirname, "..", "models", "vendorAccountDB"));
const Admin = require(path.join(__dirname, "..", "models", "adminAccountDB"));

module.exports = async (req, res, next) => {
  const users = await User.find();
  const vendors = await Vendor.find();
  const admin = await Admin.find();
  for (let user of users) {
    if (
      user.email === req.body.email ||
      user.mobileNumber === req.body.mobileNumber
    ) {
      return res.json({ error: "Email or Mobile No. already exists." });
    } else {
      for (let vendor of vendors) {
        if (
          vendor.email === req.body.email ||
          vendor.mobileNumber === req.body.mobileNumber
        ) {
          return res.json({ error: "Email or Mobile No. already exists." });
        } else {
          for (let admin of admins) {
            if (
              admin.email === req.body.email ||
              admin.mobileNumber === req.body.mobileNumber
            ) {
              return res.json({ error: "Email or Mobile No. already exists." });
            }else{
              next()
            }
          }
        }
      }
    }
  }
};

// {email : req.body.email, mobileNumber : req.body.mobileNumber}
