const path = require("path");

// Importing mongoose collections
const vendordb = require(path.join(
  __dirname,
  "..",
  "..",
  "models",
  "vendorAccountDB"
));

exports.getRequests = async (req, res, next) => {
  let user = await vendordb.find();
  // if(!user) return res.json({error : 'No Requests'})
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

exports.postRequests = (req, res, next) => {};
