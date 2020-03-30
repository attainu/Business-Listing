// NPM modules
const [path, Joi] = [require("path"), require("@hapi/joi")];

// Middlewares/custom files import
const [Services, Businesslists, async] = [
  require(path.join(__dirname, "..", "models", "Services")),
  require(path.join(__dirname, "..", "models", "BusinessLists")),
  require(path.join(__dirname, "..", "middlewares", "asyncHandler"))
];

// Fetch all services
exports.getServicesList = async(async (req, res, next) => {
  // let service
  // const businessId = req.params.businessid
  // if(businessId){
  //     service = Services.find({businesslist : businessId})
  // }else{
  //     service = Services.find()
  // }
  // await service
  // res.status(200).json({ success : true, count : service.length, data : service})
  let service = await Services.find().populate("businesslists");
  if (service.length < 1) {
    return res.status(404).json({ success: false, data: [] });
  } else {
    if (req.params.id) {
      service = await Services.find({ businesslist: req.params.id }).populate(
        "businesslists"
      );
      res.status(200).json({ success: true, data: service });
    } else {
      service = await Services.find().populate("businesslists");
      return res
        .status(200)
        .json({ success: true, count: service.length, data: service });
    }
  }
});

exports.getSingleService = async(async (req, res, next) => {
  let service = await Services.findById(req.params.id);
  if (!service) {
    return res.status(400).json({
      success: false,
      data: [],
      error: `NO resource found with the requested id ${req.params.id}`
    });
  } else {
    return res.status(200).json({ success: true, data: service });
  }
});

exports.createNewService = async(async (req, res, next) => {
  req.body.businesslists = req.params.id;
  const business = await Businesslists.findById(req.params.id);
  if (!business) {
    return res.status(400).json({
      success: false,
      error: `NO resource found with the requested id ${req.params.id}`
    });
  }
  const service = await Services.create(req.body);
  return res.status(201).json({ success: true, data: service });
});

exports.updateCourse = async(async (req, res, next) => {
  let service = await Services.findById(req.params.id);
  if (!service) {
    return res.status(400).json({
      success: false,
      error: `NO resource found with the requested id ${req.params.id}`
    });
  }
  service = await Services.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runvalidators: true
  });
  return res.status(201).json({ success: true, data: service });
});

exports.deleteCourse = async(async (req, res, next) => {
  const service = await Services.findById(req.params.id);
  if (!service) {
    return res.status(400).json({
      success: false,
      error: `NO resource found with the requested id ${req.params.id}`
    });
  }
  await Services.remove()
  return res.status(201).json({ success: true, data:{} });
});