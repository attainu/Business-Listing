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
const userControllers = require(path.join(
  __dirname,
  "..",
  "controllers",
  "clientAccountController"
));

// Register Routes
router
  .route("/client/register")
  .get(userControllers.getRegister)
  .post(emailexists, userControllers.postRegister);

router
  .route("/client/login")
  .get(userControllers.getLogin)
  .post(emailVerified, userControllers.postLogin);

router
  .route("/client/logout")
  .delete(Authorized, userControllers.DeleteLogout);

module.exports = router;
