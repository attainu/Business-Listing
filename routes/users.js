// Initializing Express Router
const [router, path] = [require("express").Router(), require("path")];

// Import Email Exists route
const emailexists = require(path.join(
  __dirname,
  "..",
  "middlewares",
  "emailExists"
));

//
const Authorized = require(path.join(
  __dirname,
  "..",
  "middlewares",
  "authorized"
));
const emailVerified = require(path.join(
  __dirname,
  "..",
  "middlewares",
  "emailVerified"
));

// Importing Controller Routes
const userclientControllers = require(path.join(
  __dirname,
  "..",
  "controllers",
  "user",
  "clientAccountController"
));
const userVendorControllers = require(path.join(
  __dirname,
  "..",
  "controllers",
  "vendor",
  "vendorAccountController"
));
// Client Routes

// Register Routes
router
  .route("/client/register")
  .get(userclientControllers.getRegister)
  .post(emailexists, userclientControllers.postRegister);

// Login Routes
router
  .route("/client/login")
  .get(userclientControllers.getLogin)
  .post(emailVerified, userclientControllers.postLogin);

// Logout Routes
router
  .route("/client/logout")
  .delete(Authorized, userclientControllers.DeleteLogout);



// Vendor Routes

// Register Routes
router
  .route("/vendor/register")
  .get(userVendorControllers.getRegister)
  .post(userVendorControllers.postRegister);

// Login Routes
router
  .route("/vendor/login")
  .get(userVendorControllers.getLogin)
  .post(emailVerified, userVendorControllers.postLogin);

// Logout Routes
router
  .route("/vendor/logout")
  .delete(Authorized, userVendorControllers.DeleteLogout);

// Exporting router module
module.exports = router;
