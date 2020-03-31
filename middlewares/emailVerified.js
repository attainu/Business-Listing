const path = require("path");

// Mongoose collections paths
const User = require(path.join(__dirname, '..', 'models', 'Users'))

module.exports = async (req, res, next) => {
  const {email} = req.body

  // Checking admin is verified
  if (req.url === '/login') {
    const user = await User.findOne({email : email})
    if (!user) {
      return res.json({ error: "Invalid Email" });
    } else {
      if (user.isVerified === false) {
        return res.json({ message: "Email Verification Pending" });
      } else {
        next();
      }
    }
  }else{
    return res.status(406).json({success : false, error : `role is required`})
  }

  // // Checking client is verified
  // if (req.url === '/client/login') {
  //   const user = await User.findOne({email : email})
  //   if (!user) {
  //     return res.json({ error: "Invalid Email" });
  //   } else {
  //     if (user.isVerified === false) {
  //       return res.json({ message: "Email Verification Pending" });
  //     } else {
  //       next();
  //     }
  //   }
  // }

  // // checking vendor is verified
  // if (req.url === '/vendor/login') {
  //   const user = await Vendor.findOne({email : email})
  //   if (!user) {
  //     return res.json({ error: "Invalid Email" });
  //   } else {
  //     if (user.isVerified === false) {
  //       return res.json({ message: "Email Verification Pending" });
  //     } else {
  //       next();
  //     }
  //   }
  // }
};
