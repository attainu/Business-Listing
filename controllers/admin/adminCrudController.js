const path = require("path");

// Importing mongoose collections
const Vendor = require(path.join(
  __dirname,
  "..",
  "..",
  "models",
  "vendorAccountDB"
));

// Importing password sent modules
const passwordSent = require(path.join(__dirname, '..','..', 'email', 'passwordSent'))

// Fetching all activation requests
exports.getRequests = async (req, res, next) => {
  let user = await Vendor.find();
  user.forEach(vendor => {
    if (vendor.isAdminVerified === false) {
      return res.json({
        id: vendor._id,
        businessName: vendor.businessName,
        business: vendor.businessType,
        Mobile: vendor.mobileNumber
      });
    } else {
      res.json({ error: "No Requests" });
    }
  });
};

// Fetching and activating the vendor request
exports.getSingleRequest = async (req, res, next) => {
  let vendorId = req.params.id;
  if (!vendorId) {
    res.json({ error: "No valid parameter passed" });
  } else {
    let user = await Vendor.findOne({ _id : vendorId });
    if(!user){
      return res.json({ error: "Invalid Id || Vendor" });
    }else{
      user.isAdminVerified = true;
      await user.save();
      passwordSent(user.email, user.passwordToken)
      return res.json({ message: "Verified Vendor Successfully." });
    }
    // if (user) {
    //   user.isAdminVerified = true;
    //   await user.save();
    //   passwordSent(email, password)
    //   return res.json({ message: "Verified Vendor Successfully." });
    // } else {
    //   return res.json({ error: "Invalid Id || Vendor" });
    // }
  }
};

exports.deleteSingleRequest = async (req, res, next) => {};

exports.postRequests = (req, res, next) => {};
