const [mongoose, slugify] = [require("mongoose"), require('slugify')];

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, `Business Name can't be empty`],
      trim: true
    },
    address: {
      type: Object,
      required: [true, `Address can't be empty`]
    },
    rating: {
      type: [Number],
      min: [1, `Minimum rating should be 1`],
      max: [5, `Maximum rating should be 5`],
      default: 0
    },
    category: {
      type: String,
      required: [true, `Business type can't be empty`],
      enum: [
        "Photographer",
        "Conventions",
        "Florist",
        "Cake",
        "Catering",
        "Dress",
        "Jewellery",
        "DJ On Hire",
        "Dance Groups",
        "Dhol Players",
        "Event Organisers",
        "Flower Decorators",
        "Generator and Power Backup",
        "Guest Houses",
        "Horses on Hire",
        "Juice Services",
        "Mehandi Artists",
        "Pandits",
        "Pan Suppliers",
        "Wedding Cards",
        "Sound System On Hire",
        "Grand Entries",
        "Bridal Makeup"
      ]
    },
    banner: {
      type: String,
      default: "banner-image.jpg"
    },
    gallery: {
      type: [String],
      default: [
        "gallery-1.jpg",
        "gallery-2.jpg",
        "gallery-3.jpg",
        "gallery-4.jpg",
        "gallery-5.jpg",
        "gallery-6.jpg"
      ]
    },
    profilePic: {
      type: String,
      default: "profilepic.jpg"
    },
    price: {
      type: String,
      required: true
    },
    primaryContact: {
      type: Number,
      min: [10, `Enter a valid mobile number`],
      required: true
    },
    Telephone: {
      type: Number,
      min: [10, `Enter a valid mobile number`],
      max: [13, `Enter a valid mobile number`],
      default: null
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        `Enter valid url with http/https`
      ],default : ''
    },facebookurl : {
        type : String,
        default : null
    },instagramurl : {
        type : String,
        default : null
    },youtubeurl : {
        type : String,
        default : null
    },email : {
        type : String,
        required : [true, `Email can't be empty`]
    },keywords : {
        type : [String],
        default : ''
    },slug : String,
    user : {
      type : mongoose.Types.ObjectId,
      ref : 'User',
      required : true
    }
  },{
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
  },
  {
    timestamps: true
  }
);

businessSchema.pre('save', function(next){
  this.slug = slugify(this.name, {lower : true})
  next()
})

businessSchema.pre('remove', async function(next){
  await this.model('Service').deleteMany({businesslists : this._id})
  next()
})

businessSchema.virtual('services',{
  ref : 'Service',
  localField : '_id',
  foreignField : 'businesslists',
  justOne : false
})

module.exports = mongoose.model('Businesslist', businessSchema)