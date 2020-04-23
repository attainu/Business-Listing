const [path, mongoose] = [require("path"), require("mongoose")];
// Database models
const [Admin, User, Businesslist, Service] = [
  require(path.join(__dirname, "..", "models", "Admin")),
  require(path.join(__dirname, "..", "models", "Users")),
  require(path.join(__dirname, "..", "models", "BusinessLists")),
  require(path.join(__dirname, "..", "models", "Services"))
];

// Importing mongoose collections
const [async] = [
  require(path.join(__dirname, "..", "middlewares", "asyncHandler"))
];
// Register
exports.Register = async(async (req, res, next) => {
  const { username, email, password } = req.body;
  const admin = new Admin({ username, email, password });
  const user = await Admin.find();
  if (user.length < 1) {
    await admin.save();
    storecookie(admin, 200, res);
  } else {
    return res
      .status(406)
      .json({ success: false, error: `Admin already exists.` });
  }
});
// Login
exports.Login = async(async (req, res, next) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(400).json({ success: false, error: `Email not found` });
  } else {
    const match = admin.passwordVerify(password);
    if (!match) {
      return res
        .status(403)
        .json({ success: false, error: `Email || Password doesn't match` });
    } else {
      storecookie(admin, 200, res);
    }
  }
});
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
  query = Businesslist.find(JSON.parse(queryString)).populate("services");
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
  const total = await Businesslist.countDocuments();
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
// Get Business activation request
exports.getRequests = async(async (req, res, next) => {
  const vendors = await Businesslist.find();
  const vendorarr = []
  vendors.forEach(vendor => {
    if ( vendor.isAdminVerified === false) {
      vendorarr.push(vendor)
    }
  })
  res.status(200).json({ success: true,count : vendorarr.length, data: vendorarr });
});
// Fetching and activating the vendor request
exports.getSingleRequest = async (req, res, next) => {
  let vendorId = req.params.id;
  try {
    if (!vendorId) {
      res.json({ error: "No valid parameter passed" });
    } else {
      let user = await Businesslist.findOne({ _id: vendorId });
      if (!user) {
        return res.json({ error: "Invalid Id || Vendor" });
      } else {
        user.isAdminVerified = true;
        await user.save();
        return res.json({ message: "Verified Vendor Successfully." });
      }
    }
  } catch (error) {
    next(error);
  }
};
// Remove business
exports.deleteSingleRequest = async (req, res, next) => {
  let vendorId = req.params.id;
  try {
    if (!vendorId) {
      res.json({ error: "No valid parameter passed" });
    } else {
      let user = await Businesslist.findOne({ _id: vendorId });
      if (!user) {
        return res.json({ error: "Invalid Id || Vendor" });
      } else {
        await user.remove();
        let services = await Service.find()
        return res.json({ message: "Deleted Vendor Successfully." });
      }
    }
  } catch (error) {
    next(error);
  }
};
// // Fetch all vendors
// exports.fetchAllVendors = async (req, res, next) => {
//   try {
//     const vendors = await Vendor.find()
//       .sort({ createdAt: -1 })
//       .select(
//         "username businessName email businessType mobileNumber isAdminVerified isVerified"
//       );
//     if (vendors.length < 1) {
//       return res.json({ error: "No User Found" });
//     } else {
//       return res.json(vendors);
//     }
//   } catch (error) {
//     next(error);
//   }
// };
// Fetch all clients
exports.fetchAllclients = async (req, res, next) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("username email mobileNumber isVerified");
    if (users.length < 1) {
      return res.json({ error: "No User Found" });
    } else {
      return res.json(users);
    }
  } catch (error) {
    next(error);
  }
};
// Create a business
exports.createBusiness = async(async (req, res, next) => {
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
    const existeduser = await Businesslist.findOne({ user: req.user.id });
    // console.log(existeduser)
    if (existeduser && req.user.role !== "admin") {
      return res.status(406).json({
        success: false,
        error: `You're not authorized to create another business, Please contact admin for further details`
      });
    }
    const data = new Businesslist({
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
    res.status(201).json({ success: true, message : `Congrats You've successfully posted your business, Your business is under review, we'll get back to you in soon.` });
  }
});
// Delete user by id
exports.deleteSingleUser = async (req, res, next) => {
  let userId = req.params.id;
  try {
    if (!userId) {
      res.json({ error: "No valid parameter passed" });
    } else {
      let user = await User.findOne({ _id: userId });
      if (!user) {
        return res.json({ error: "Invalid Id || Vendor" });
      } else {
        await user.remove();
        return res.json({ message: "Deleted user Successfully." });
      }
    }
  } catch (error) {
    next(error);
  }
};
// Delete services
exports.deleteServices = async (req, res, next) => {
  let serviceId = req.params.id;
  try {
    if (!serviceId) {
      res.json({ error: "No valid parameter passed" });
    } else {
      let service = await Service.findOne({ _id: serviceId });
      if (!service) {
        return res.json({ error: "Invalid Id || Vendor" });
      } else {
        await user.remove();
        return res.json({ message: "Deleted service Successfully." });
      }
    }
  } catch (error) {
    next(error);
  }
}
// Storing jwt token in cookie
const storecookie = (admin, status, res) => {
  const token = admin.signJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRE_COOKIE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(status)
    .cookie("token", token, options)
    .json({ success: true, token });
};

exports.postRequests = (req, res, next) => {};
