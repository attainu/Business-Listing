const path = require('path')

const User = require(path.join(__dirname, '..', 'models', 'clientAccountDB'))

module.exports = async (req, res, next) => {
    const user = await User.find({email : req.body.email})
    if(!user){
        return res.json({error : 'Invalid Email'})
    }else{
        if(user.isVerified === false){
            return res.json({message : 'Email Verification Pending'})
        }else{
            next()
        }
    }
}