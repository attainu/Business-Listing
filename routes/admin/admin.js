// Initializing Express Router
const [router, path] = [require("express").Router(), require("path")];

// Importing Middlewares
const Authorized = require(path.join(
  __dirname,
  "..",
  "..",
  "middlewares",
  "authorized"
));

// Importing Controller Routes
const adminControllers = require(path.join(
  __dirname,
  "..",
  "..",
  "controllers",
  "admin",
  "adminAccountController"
));
const adminActivations = require(path.join(
  __dirname,
  "..",
  "..",
  "controllers",
  "admin",
  "adminActivationsController"
));

// Register Routes
router
  .route("/auth/register")
  .get(adminControllers.getRegister)
  .post(adminControllers.postRegister);

// Login Routes
router
  .route("/auth/login")
  .get(adminControllers.getLogin)
  .post(adminControllers.postLogin);

// Logout Routes
router.route("/auth/logout").delete(Authorized, adminControllers.DeleteLogout);

// Get All Activation list
router
  .route("/activate")
  .get(adminActivations.getRequests)
  .post(adminActivations.postRequests);

// Get Single Activation List
router.route("/activate/:id").get(adminActivations.getSingleRequest);

// Delete Activation Request
router.route('/activate/:id').delete(adminActivations.deleteSingleRequest);

// Exporting router module
module.exports = router;
