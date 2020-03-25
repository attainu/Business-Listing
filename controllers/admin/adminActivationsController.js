const path = require("path");

// Importing mongoose collections
const vendordb = require(path.join(
  __dirname,
  "..",
  "..",
  "models",
  "vendorAccountDB"
));

// Fetching all activation requests
exports.getRequests = async (req, res, next) => {
  let user = await vendordb.find();
  user.forEach(vendor => {
    if (vendor.isAdminVerified === false) {
      return res.json({
        id: vendor._id,
        businessName: vendor.businessName,
        business: vendor.businessType,
        Mobile: vendor.mobileNumber
      });
    }else{
        res.json({ error : 'No Requests'})
    }
  });
};

// Fetching and activating the vendor request
exports.getSingleRequest = async (req, res, next) => {
    let vendorId = req.params.id
    let user = await vendordb.findOne({_id : vendorId})
    if(user){
        user.isAdminVerified = true
        await user.save()

        res.json({message : 'Verified Vendor Successfully.'})
    }else{
        return res.json({error : 'Invalid Id || Vendor'})
    }
}

exports.deleteSingleRequest = async (req, res, next) => {
    
}

exports.postRequests = (req, res, next) => {};
