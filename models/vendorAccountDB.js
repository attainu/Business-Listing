const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },
    businessName: {
      type: String,
      required: true
    },
    businessType: {
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
    passwordToken: {
      type: String
    },
    mobileNumber: {
      type: Number,
      required: true
    },
    token: {
      type: String
    },
    secretToken: {
      type: String
    },
    isVerified: {
      type: Boolean,
      required: true
    },
    isAdminVerified: {
      type: Boolean,
      required: true
    },
    BusinessAddress: [
      {
        DNo: {
          type: String,
          required: true
        },
        Street: {
          type: String,
          required: true
        },
        City: {
          type: String,
          required: true
        },
        Pincode: {
          type: Number,
          required: true
        }
      }
    ],
    gstinNumber: {
      type: String,
      required: true
    }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }
);

module.exports = mongoose.model("vendorAccount", schema);
