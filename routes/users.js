// Initializing Express Router
const [router, path] = [require("express").Router(), require("path")];

// Importing Middlewares
const emailexists = require(path.join(
  __dirname,
  "..",
  "middlewares",
  "emailExists"
));
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
const adminVerified = require(path.join(
  __dirname,
  "..",
  "middlewares",
  "adminVerified"
));

// Importing Controller Routes
const {postRegister, postLogin, DeleteLogout} = require(path.join(
  __dirname,
  "..",
  "controllers",
  "users"
));
// Register Routes
router
  .route("/register")
  .post(emailexists, postRegister);
// Login Routes
router
  .route("/login")
  .post(emailVerified, postLogin);
// Logout Routes
router
  .route("/logout")
  .delete(Authorized, DeleteLogout);
// search for a vendor
router.route('/client/search').get()
// Exporting router module
module.exports = router;
