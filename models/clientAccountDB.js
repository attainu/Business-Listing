const mongoose = require("mongoose");

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
      required: true
    },
    passwordToken : {
      type : String
    },
    mobileNumber: {
      type: Number,
      required: true
    },
    token: {
      type: String
    },
    secretToken: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      required: true
    }
  },
  {
    timestamps : {
        createdAt : 'createdAt',
        updatedAt : 'updatedAt'
    }
}
);

module.exports = mongoose.model("ClientAccount", schema);