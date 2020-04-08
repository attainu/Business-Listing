// NPM modules
const [path, Joi, multer, cloudinary] = [
  require("path"),
  require("@hapi/joi"),
  require("multer"),
  require("cloudinary"),
];

// Middlewares/custom files import
const [BusinessList, User, async, uploadSingle, uploadArray, Order] = [
  require(path.join(__dirname, "..", "models", "BusinessLists")),
  require(path.join(__dirname, "..", "models", "Users")),
  require(path.join(
    __dirname,
    "..",
    "middlewares",
    "asyncHandler"
  ), require(path.join(__dirname, "..", "multerSingle"))),
  require(path.join(__dirname, "..", "multerArray")),
  require(path.join(__dirname, "..", "models", "Orders")),
];
// cloudinary
require(path.join(__dirname, "..", "cloudinary"));

// Fetch business by id
exports.getBusinessListByID = async(async (req, res, next) => {
  const businesslist = await BusinessList.findById(req.params.id);
  if (!businesslist) {
    return res.status(400).json({
      success: false,
      error: `No valid resource found with requested id ${req.params.id}`,
    });
  }
  res
    .status(200)
    .json({ success: true, count: businesslist.length, data: businesslist });
});
// Get requests
exports.getOrders = async(async (req, res, next) => {
  if (req.user.role !== "vendor")
    return res.status(401).json({
      success: false,
      error: `You're not authorized to perform this task`,
    });
  const user = req.user._id;
  if (!user)
    return res
      .status(401)
      .json({ success: false, error: `Unauthorized access detected.` });
  const orders = await Order.find({ vendorId: user });
  if (!orders)
    return res
      .status(404)
      .json({ success: false, count: orders.length, error: `No orders.` });
  return res
    .status(200)
    .json({ success: true, count: orders.length, data: orders });
});
exports.acceptOrders = async(async (req, res, next) => {
  const orderId = req.params.id;
  if (!orderId)
    return res.status(406).json({
      success: false,
      error: `No valid resource found with requested id ${orderId}`,
    });
  const order = await Order.find({ vendorId: orderId });
  if (!order)
    return res.status(404).json({
      success: false,
      count: 0,
      error: `No valid resource found with requested id.`,
    });
  order.isAccepted = true;
  await order.save();
  return res
    .status(200)
    .json({ success: true, message: `Congrats, You'd accepted an order.` });
});
// Create a business
exports.createBusinessList = async(async (req, res, next) => {
  const user = req.user.id;
  // declaring variables
  const {
    name,
    email,
    category,
    city,
    state,
    pincode,
    area,
    dno,
    street,
    address,
    district,
    price,
    primaryContact,
  } = req.body;
  //validation using joi
  const Schema = Joi.object({
    name: Joi.string().required().max(50),
    category: Joi.string().required().max(15),
    city: Joi.string().required().min(4).max(15),
    state: Joi.string().required().min(4).max(15),
    area: Joi.string().required().min(4).max(20),
    dno: Joi.string().min(5).max(12).required(),
    street: Joi.string().required().min(4).max(15),
    address: Joi.string().required().min(4).max(100),
    district: Joi.string().required().min(4).max(15),
    price: Joi.number().required().min(3),
    primaryContact: Joi.number().required().min(10),
    pincode: Joi.string().required().min(6).max(10),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
  });
  const { error, result } = Schema.validate({
    name: name,
    category: category,
    city: city,
    state: state,
    area: area,
    dno: dno,
    street: street,
    address: address,
    district: district,
    price: price,
    primaryContact: primaryContact,
    pincode: pincode,
    email: email,
  });
  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  } else {
    const existeduser = await BusinessList.findOne({ user: req.user.id });
    // console.log(req.user)
    if (existeduser && req.user.role !== "admin") {
      return res.status(406).json({
        success: false,
        error: `You're not authorized to create another business, Please contact admin for further details`,
      });
    }
    const data = new BusinessList({
      user,
      name,
      category,
      price,
      primaryContact,
      email,
      address: {
        city: city,
        state: state,
        area: area,
        dno: dno,
        street: street,
        address: address,
        district: district,
        pincode: pincode,
      },
    });
    await data.save();
    res.status(201).json({
      success: true,
      message: `Congrats You've successfully posted your business, Your business is under review, we'll get back to you in soon.`,
    });
  }
});

// update business by id
exports.updateBusinessListByID = async(async (req, res, next) => {
  let businesslist = await BusinessList.findById(req.params.id);
  console.log(req.user.id);
  if (!businesslist) {
    return res.status(400).json({
      success: false,
      error: `No valid resource found with requested id ${req.params.id}`,
    });
  }
  if (
    businesslist.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      error: `Requested user ${req.user.id} is not authorized to perform this action`,
    });
  }
  businesslist = await BusinessList.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runvalidators: true,
  });
  res.status(201).json({ success: true, data: businesslist });
});

// Updating Banner Image
exports.bannerImage = async(async (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({ msg: err });
    }
  });
  const businesslist = await BusinessList.findById(req.params.id);
  if (!businesslist) {
    return res.status(400).json({
      success: false,
      error: `No valid resource found with requested id ${req.params.id}`,
    });
  } else {
    if (
      businesslist.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: `Requested user ${req.user.id} is not authorized to perform this action`,
      });
    }
    try {
      const imagedata = await cloudinary.v2.uploader.upload(req.file.path);
      const successdata = await BusinessList.findByIdAndUpdate(
        req.params.id,
        { $set: { banner: imagedata.secure_url } },
        { new: true, runvalidators: true }
      );
      return res.status(200).json({ success: true, data: successdata });
    } catch (err) {
      return res.status(401).json({ success: false, err });
    }
  }
});

// Updating Image Collections
exports.imageCollections = async(async (req, res, next) => {
  let arr = req.files;
  console.log(arr)
  // console.log(arr, req.user._id)
  uploadArray(req, res, err => {
    if (err) {
      return res.status(400).json({ msg: err });
    }
  });
  const businesslist = await BusinessList.findById(req.params.id);
  if (!businesslist) {
    return res.status(400).json({
      success: false,
      error: `No valid resource found with requested id ${req.params.id}`,
    });
  } else {
    // if(businesslist.user != req.user._id){
    //   return res.status(403).json({success : false, error : `requested user with id ${req.user._id} is not authorized to perform this action.`})
    // }
    if (businesslist.gallery.length === 6) {
      return res.status(406).json({
        success: false,
        error: `You'd reached the maximum gallery upload limit. Please delete older images to update new images`,
      });
    } else {
      try {
        let gallery = businesslist.gallery;
        for (let elem of arr) {
          let imagedata = await cloudinary.v2.uploader.upload(elem);
          gallery.push(imagedata.secure_url)
        }
        const successdata = await BusinessList.findByIdAndUpdate(
          req.params.id,
          { $set: { gallery: gallery } },
          { new: true, runvalidators: true }
        );
        return res.status(200).json({ success: true, data : successdata });
      } catch (err) {
        return res.status(401).json({ success: false });
      }
    }
  }
});

// Delete gallery images
exports.deleteGallery = async(async (req, res, next) => {
  const businessid = await BusinessList.findById(req.params.id);
  if (!businessid) {
    return res.status(400).json({
      success: false,
      error: `No valid resource found with requested id ${req.params.id}`,
    });
  } else {
    if (
      businessid.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: `Requested user ${req.user.id} is not authorized to perform this action`,
      });
    }
    let data = businessid.gallery;
    let arr = req.query.gallery.split(",");
    var difference = data.filter((x) => arr.indexOf(x) === -1);
    console.log(difference);
    let user = await BusinessList.findById(req.params.id);
    let updated = await BusinessList.findByIdAndUpdate(req.params.id, {
      $set: { gallery: difference },
    });
    res.status(201).json({ success: true, data: updated });
  }
});

// Delete business by id
exports.deleteBusinessListByID = async(async (req, res, next) => {
  const businesslist = await BusinessList.findById(req.params.id);
  if (!businesslist) {
    return res.status(400).json({
      success: false,
      error: `No valid response for id ${req.params.id}`,
    });
  }
  if (
    businesslist.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      error: `Requested user ${req.user.id} is not authorized to perform this action`,
    });
  }
  businesslist.remove();
  res.status(200).json({ success: true, data: [] });
});
