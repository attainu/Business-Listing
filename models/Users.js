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
    },block : {
      type : Boolean,
      default : true
    }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }
);
// Signing JWT Token
schema.methods.signJwtToken = function(){
  return sign({id : this._id}, process.env.JWT_SECRET, {expiresIn : process.env.JWT_EXPIRE})
}
// Dehashing password with bcryptjs
schema.methods.verifyPassword = async function(pass){
  return await compare(pass, this.password)
}
// exporting mongoose user model
module.exports = mongoose.model("User", schema);
