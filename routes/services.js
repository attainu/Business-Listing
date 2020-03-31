const [router, path] = [require("express").Router({mergeParams : true}), require("path")];

// vendor controller
const {
  getServicesList,
  createNewService,
  getSingleService,
  updateCourse,
  deleteCourse
} = require(path.join(__dirname, "..", "controllers", "services"));

const {authorized,roleauthor} = require(path.join(
  __dirname,
  "..",
  "middlewares",
  "authorized"
));

// routes
router
  .route("/")
  .get(getServicesList)
  .post(authorized, roleauthor('admin', 'vendor'), createNewService);

router
  .route("/:id")
  .get(getSingleService)
  .put(authorized, roleauthor('admin', 'vendor'), updateCourse)
  .delete(authorized, roleauthor('admin', 'vendor'), deleteCourse);


// router
//   .route("/:id")
//   .get(getBusinessListByID)
//   .put(updateBusinessListByID)
//   .delete(deleteBusinessListByID);

module.exports = router;
