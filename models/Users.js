const [mongoose, bcrypt, dotenv, crypto] = [require("mongoose"), require("bcryptjs"), require('dotenv').config(), require('crypto')];
const { hash, compare } = bcrypt;
const {sign, verify} = require('jsonwebtoken')

// user schema
const schema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required : [true, `password field can't be empty`],
      minlength : [8, `minimum 8 characters`]
    },
    passwordToken: {
      type: String
    },
    mobileNumber: {
      type: Number,
      required: true
    },
    role: {
      type: String,
      enum: ["user", "vendor"],
      required: true
    },
    secretToken: {
      type: String
    },
    isVerified: {
      type: Boolean,
      required: true,
      default : false
    },
    isAdminVerified : {
      type : Boolean,
      required : true,
      default : false
    },resetPasswordExpire : {
      type : String
    }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }
);

// Hashing password with passwordToken using bcryptjs
// schema.pre("save", async function(next) {
//   if(!this.isModified('password')){
//     next()
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await hash(this.passwordToken, salt);
//   next();
// });

// Signing JWT Token
schema.methods.signJwtToken = function(){
  return sign({id : this._id}, process.env.JWT_SECRET, {expiresIn : process.env.JWT_EXPIRE})
}

// Dehashing password with bcryptjs
schema.methods.verifyPassword = async function(pass){
  return await compare(pass, this.password)
}

// Generate and hash token
// schema.methods.generatePasswordToken = function(){
//   const token = crypto.randomBytes(20).toString('hex')
//   this.passwordToken = crypto.createHash('sha256').update(token).digest('hex')
//   this.resetPasswordExpire = Date.now() + 10 * 60 * 1000
//   return token
// }

// exporting mongoose user model
module.exports = mongoose.model("User", schema);
