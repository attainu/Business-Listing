const [path, mongoose] = [require('path'), require('mongoose')]
const User = require(path.join(__dirname, '..', 'models', 'Users'))

module.exports = async (req, res, next) => {
  const user = await User.findOne({email : req.body.email})
  if(user){
    return res.json({error : 'Email already exists'})
  }else{
    next()
  }
}