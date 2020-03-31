// NPM modules
const [path, Joi, multer, cloudinary] = [
  require("path"),
  require("@hapi/joi"),
  require("multer"),
  require("cloudinary")
];

// Middlewares/custom files import
const [BusinessList, User, async, uploadSingle, uploadArray] = [
  require(path.join(__dirname, "..", "models", "BusinessLists")),
  require(path.join(__dirname, "..", "models", "Users")),
  require(path.join(
    __dirname,
    "..",
    "middlewares",
    "asyncHandler"
  ), require(path.join(__dirname, "..", "multerSingle"))),
  require(path.join(__dirname, "..", "multerArray"))
];
// cloudinary
require(path.join(__dirname, "..", "cloudinary"));

// Fetch all businesses
exports.getBusinessLists = async(async (req, res, next) => {
  let query;
  let reqQuery = { ...req.query };
  const removeFields = ["select", "sort", "limit", "page"];
  // filtering through query params using mongoose bitwise operators
  removeFields.forEach(params => delete reqQuery[params]);
  let queryString = JSON.stringify(reqQuery);
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in)\b/,
    match => `$${match}`
  );
  query = BusinessList.find(JSON.parse(queryString)).populate("services");
  // Filtering through query params using select
  if (req.query.select) {
    let fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }
  // Filtering through query params using select
  if (req.query.sort) {
    let fields = req.query.sort.split(",").join(" ");
    query = query.sort(fields);
  } else {
    query = query.sort("-createdAt");
  }
  // Pagination
  const page = parseInt(req.query.page, 3) || 1;
  const limit = parseInt(req.query.limit, 3) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await BusinessList.countDocuments();
  query = query.skip(startIndex).limit(limit);
  // Executing businessLists
  const businesslist = await query;
  // Pagination result
  const Pagination = {};
  if (endIndex < total) {
    Pagination.next = {
      page: page + 1,
      limit
    };
  }
  if (startIndex > 0) {
    Pagination.prev = {
      page: page - 1,
      limit
    };
  }
  res
    .status(200)
    .json({ success: true, count: businesslist.length, data: businesslist });
});

// Fetch business by id
exports.getBusinessListByID = async(async (req, res, next) => {
  const businesslist = await BusinessList.findById(req.params.id);
  if (!businesslist) {
    return res.status(400).json({
      success: false,
      error: `No valid resource found with requested id ${req.params.id}`
    });
  }
  res
    .status(200)
    .json({ success: true, count: businesslist.length, data: businesslist });
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
    primaryContact
  } = req.body;
  //validation using joi
  const Schema = Joi.object({
    name: Joi.string()
      .required()
      .max(50),
    category: Joi.string()
      .required()
      .max(15),
    city: Joi.string()
      .required()
      .min(4)
      .max(15),
    state: Joi.string()
      .required()
      .min(4)
      .max(15),
    area: Joi.string()
      .required()
      .min(4)
      .max(20),
    dno: Joi.string()
      .min(5)
      .max(12)
      .required(),
    street: Joi.string()
      .required()
      .min(4)
      .max(15),
    address: Joi.string()
      .required()
      .min(4)
      .max(100),
    district: Joi.string()
      .required()
      .min(4)
      .max(15),
    price: Joi.number().required(),
    primaryContact: Joi.number().required(),
    pincode: Joi.string()
      .required()
      .min(6)
      .max(10),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] }
    })
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
    email: email
  });
  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  } else {
    const existeduser = await BusinessList.findOne({ user: req.user.id });
    // console.log(existeduser)
    if (existeduser && req.user.role !== "admin") {
      return res.status(406).json({
        success: false,
        error: `You're not authorized to create another business, Please contact admin for further details`
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
        pincode: pincode
      }
    });
    await data.save();
    res.status(201).json({ success: true, data: data });
  }
});

// update business by id
exports.updateBusinessListByID = async(async (req, res, next) => {
  let businesslist = await BusinessList.findById(req.params.id);
  console.log(req.user.id);
  if (!businesslist) {
    return res.status(400).json({
      success: false,
      error: `No valid resource found with requested id ${req.params.id}`
    });
  }
  if (
    businesslist.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      error: `Requested user ${req.user.id} is not authorized to perform this action`
    });
  }
  businesslist = await BusinessList.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runvalidators: true
  });
  res.status(201).json({ success: true, data: businesslist });
});

// Updating Banner Image
exports.bannerImage = async(async (req, res, next) => {
  uploadSingle(req, res, err => {
    if (err) {
      return res.status(400).json({ msg: err });
    }
  });
  const businesslist = await BusinessList.findById(req.params.id);
  if (!businesslist) {
    return res.status(400).json({
      success: false,
      error: `No valid resource found with requested id ${req.params.id}`
    });
  } else {
    if (
      businesslist.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: `Requested user ${req.user.id} is not authorized to perform this action`
      });
    }
    const imagedata = await cloudinary.v2.uploader.upload(req.file.path);
    const successdata = await BusinessList.findByIdAndUpdate(
      req.params.id,
      { $set: { banner: imagedata.secure_url } },
      { new: true, runvalidators: true }
    );
    return res.status(200).json({ success: true, data: successdata });
  }
});

// Updating Image Collections
exports.imageCollections = async(async (req, res, next) => {
  let arr = req.files;
  for (let elem of arr) {
    console.log(elem.path);
  }
  // uploadArray(req, res, err => {
  //   if (err) {
  //     return res.status(400).json({ msg: err });
  //   }
  // });
  const businesslist = await BusinessList.findById(req.params.id);
  if (!businesslist) {
    return res.status(400).json({
      success: false,
      error: `No valid resource found with requested id ${req.params.id}`
    });
  } else {
    if (
      businesslist.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: `Requested user ${req.user.id} is not authorized to perform this action`
      });
    }
    if (businesslist.gallery.length === 6) {
      return res.status(406).json({
        success: false,
        error: `You'd reached the maximum gallery upload limit. Please delete older images to update new images`
      });
    } else {
      const imagedata = await cloudinary.v2.uploader.upload(arr);
      console.log(imagedata);
      // const successdata = await BusinessList.findByIdAndUpdate(
      //   req.params.id,
      //   { $set: { gallery: imagedata.secure_url } },
      //   { new: true, runvalidators: true }
      // );
      // return res.status(400).json({ success: true, data: successdata });
    }
  }
});

// Delete gallery images
exports.deleteGallery = async(async (req, res, next) => {
  const businessid = await BusinessList.findById(req.params.id);
  if (!businessid) {
    return res.status(400).json({
      success: false,
      error: `No valid resource found with requested id ${req.params.id}`
    });
  } else {
    if (
      businessid.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: `Requested user ${req.user.id} is not authorized to perform this action`
      });
    }
    let data = businessid.gallery;
    let query = req.query;
    let arr = query.gallery.split(",");
    function arr_diff(a1, a2) {
      var a = [],
        diff = [];
      for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
      }
      for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
          delete a[a2[i]];
        } else {
          a[a2[i]] = true;
        }
      }
      for (var k in a) {
        diff.push(k);
      }
      return diff;
    }
    console.log(arr_diff(data, arr));
    let updated = await BusinessList.findByIdAndUpdate(req.params.id, {
      $set: { gallery: arr_diff(data, arr) }
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
      error: `No valid response for id ${req.params.id}`
    });
  }
  if (
    businesslist.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      error: `Requested user ${req.user.id} is not authorized to perform this action`
    });
  }
  businesslist.remove();
  res.status(200).json({ success: true, data: [] });
});
