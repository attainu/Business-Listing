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
  "adminCrudController"
));
const emailexists = require(path.join(
  __dirname,
  "..",
  "..",
  "middlewares",
  "emailExists"
));
const emailVerified = require(path.join(
  __dirname,
  "..",
  '..',
  "middlewares",
  "emailVerified"
));

// Register Routes
router
  .route("/register")
  .get(adminControllers.getRegister)
  .post(emailexists, adminControllers.postRegister);

// Login Routes
router
  .route("/login")
  .get(adminControllers.getLogin)
  .post(emailVerified, adminControllers.postLogin);

// Logout Routes
router.route("/logout").delete(Authorized, adminControllers.DeleteLogout);

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
