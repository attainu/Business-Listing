// Initializing Express Router
const [router, path] = [require("express").Router(), require("path")];

// Importing Middlewares
const emailexists = require(path.join(
  __dirname,
  "..",
  "middlewares",
  "emailExists"
));
const { authorized, roleauthor } = require(path.join(
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
const {
  Register,
  Login,
  Logout,
  Me,
  forgotPassword,
  verifyForgotPasswordToken,
  modifyPassword,
  getBusinessLists,
  placeOrder
} = require(path.join(__dirname, "..", "controllers", "users"));
// Register Routes
router.route("/me").get(authorized, Me);
router.route("/register").post(emailexists, Register);
// Login Routes
router.route("/login").post(emailVerified, Login);
// Logout Routes
router.route("/logout").delete(authorized, Logout);
// forgot password
router.route("/forgot-password").post(forgotPassword);
// verify forgot password token and create a new password
router.route("/create-password/:id").put(verifyForgotPasswordToken);
// Change password
router.route("/modify-password").put(authorized, modifyPassword);
// View all clients
router.route("/view-all").get(getBusinessLists);
// Request vendor
router.route("/send-request/:id").post(authorized, placeOrder);
// search for a vendor
router.route("/client/search").get();
// Exporting router module
module.exports = router;
