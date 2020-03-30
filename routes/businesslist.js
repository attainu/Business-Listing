const [router, path, multer] = [
  require("express").Router(),
  require("path"),
  require("multer")
];

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
  .post(createBusinessList);

router
  .route("/:id")
  .get(getBusinessListByID)
  .put(updateBusinessListByID)
  .delete(deleteBusinessListByID);

router.route("/image_banner/:id").put(upload, bannerImage);

router.route("/image_collections/:id").put(uploadArray, imageCollections).delete(deleteGallery);

// router.route("image_collections/:id").put(uploadArray, imageCollections);

module.exports = router;
