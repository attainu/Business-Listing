const [path, mongoose] = [require("path"), require("mongoose")];
const schema = mongoose.Schema(
  {
    date: {
      type: String,
      required: [true, `Date field can't be empty`],
    },
    event: {
      type: String,
      required: [true, `Event field can't be empty`],
    },
    description: {
      type: String,
      minlength: [30, `minimum 50 characters.`],
      required: [true, `Description field can't be empty`],
    },
    budget: {
      type: Number,
      required: [true, `Budget field can't required`],
    },
    location: {
      type: String,
      required: [true, `location field can't be empty.`],
    },isAccepted : {
      type : Boolean,
      default : false
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },block : {
      type : Boolean,
      default : true
    },
    vendorId: {
      type: mongoose.Types.ObjectId,
      ref : 'User',
      required: [true, `Error in getting vendor Id`],
    },
  },
  {
    timeStamps: true,
  }
);

module.exports = mongoose.model('Order', schema)