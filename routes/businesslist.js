const [router, path, multer] = [
  require("express").Router(),
  require("path"),
  require("multer")
];
const { authorized,roleauthor } = require(path.join(
  __dirname,
  "..",
  "middlewares",
  "authorized"
));

const upload = require(path.join(__dirname, "..", "multerSingle"));
const uploadArray = require(path.join(__dirname, "..", "multerArray"));

// vendor controller
const {
  getBusinessListByID,
  getBusinessLists,
  createBusinessList,
  updateBusinessListByID,
  deleteBusinessListByID,
  bannerImage,
  imageCollections,
  deleteGallery
} = require(path.join(__dirname, "..", "controllers", "businesslist"));

// routes Middlewares
router.use("/:id/services", require(path.join(__dirname, "services")));

// routes
router
  .route("/")
  .get(getBusinessLists)
  .post(authorized, roleauthor('admin', 'vendor'), createBusinessList);

router
  .route("/:id")
  .get(getBusinessListByID)
  .put(authorized, roleauthor('admin', 'vendor'), updateBusinessListByID)
  .delete(authorized, roleauthor('admin', 'vendor'), deleteBusinessListByID);

router.route("/image_banner/:id").put(authorized,roleauthor('admin', 'vendor'), upload, bannerImage);

router
  .route("/image_collections/:id")
  .put(authorized, roleauthor('admin', 'vendor'), uploadArray, imageCollections)
  .delete(authorized, roleauthor('admin', 'vendor'), deleteGallery);

// router.route("image_collections/:id").put(uploadArray, imageCollections);

module.exports = router;
