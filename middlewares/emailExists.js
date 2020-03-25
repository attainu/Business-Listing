const [path, mongoose] = [require('path'), require('mongoose')]
const User = require(path.join(__dirname, '..', 'models', 'clientAccountDB'))
const Vendor = require(path.join(__dirname, '..', 'models', 'vendorAccountDB'))
const Admin = require(path.join(__dirname, '..', 'models', 'adminAccountDB'))

module.exports = async (req, res, next) => {
  const user = await User.findOne({email : req.body.email})
  if(user){
    return res.json({error : 'Email already exists'})
  }else{
    const vendor = await Vendor.findOne({email : req.body.email})
    if(vendor){
      return res.json({error : 'Email already exists'})
    }else{
      const admin = await Admin.findOne({email : req.body.email})
      if(admin){
        return res.json({error : 'Email already exists'})
      }else{
        next()
      }
    }
  }
}