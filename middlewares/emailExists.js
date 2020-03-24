const path = require('path')
const User = require(path.join(__dirname, '..', 'models', 'clientAccountDB'))

module.exports = async (req, res, next) =>{
    const user = await User.findOne({email : req.body.email})
    if(user){
        return res.json({message : 'Email Already Exists'})
    }else{
        next()
    }
}