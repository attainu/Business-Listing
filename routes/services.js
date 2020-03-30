const [router, path] = [require("express").Router({mergeParams : true}), require("path")];

// vendor controller
const {
  getServicesList,
  createNewService,
  getSingleService,
  updateCourse,
  deleteCourse
} = require(path.join(__dirname, "..", "controllers", "services"));

// routes
router
  .route("/")
  .get(getServicesList)
  .post(createNewService);

router
  .route("/:id")
  .get(getSingleService)
  .put(updateCourse)
  .delete(deleteCourse);


// router
//   .route("/:id")
//   .get(getBusinessListByID)
//   .put(updateBusinessListByID)
//   .delete(deleteBusinessListByID);

module.exports = router;
