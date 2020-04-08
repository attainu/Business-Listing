const [mongoose, bcrypt, dotenv] = [require("mongoose"), require("bcryptjs"), require('dotenv').config()];
const {hash, compare} = require('bcryptjs')
const {sign, verify} = require('jsonwebtoken')

// user schema
const schema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, `username can't be empty.`],
      minlength : [4, `username contains atleast 4 characters`]
    },
    email: {
      type: String,
      required: [true, `Email can't be empty.`],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        `Enter a valid email`
      ]
    },
    password: {
      type: String,
      required : [true, `password field can't be empty`],
      minlength : [8, `minimum 8 characters`]
    },
    role: {
      type: String,
      default: 'admin'
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
// Hashing password before save
schema.pre('save', async function(next) {
    this.password = await hash(this.password, 10)
    next()
})
// Verify Password
schema.methods.passwordVerify = async function(password) {
    const Match = await compare(password, this.password)
    if(Match){
        next()
    }
}

// exporting mongoose user model
module.exports = mongoose.model("Admin", schema);
