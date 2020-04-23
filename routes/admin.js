// Initializing Express Router
const [router, path] = [require("express").Router(), require("path")];

// Importing Middlewares
const { authorized, roleauthor } = require(path.join(
  __dirname,
  "..",
  "middlewares",
  "adminAuthorized"
));

const {
  Register,
  getBusinessLists,
  Login,
  Logout,
  getRequests,
  getSingleRequest,
  deleteSingleRequest,
  fetchAllclients,
  createBusiness,
  deleteSingleUser
} = require(path.join(__dirname, "..", "controllers", "admin"));
const emailexists = require(path.join(
  __dirname,
  "..",
  "middlewares",
  "emailExists"
));
// Register Routes
router.route("/register").post(emailexists, Register);
// Login Routes
router.route("/login").post(Login);
// Logout Routes
// router.route("/logout").delete(authorized, Logout);
// // Get All Activation list
router.route("/activate").get(authorized, getRequests);
// Get Single Activation List
router.route("/activate/:id").get(authorized, getSingleRequest);
// // Delete Activation Request
router.route("/remove/vendor/:id").delete(authorized, deleteSingleRequest);
// Get All Vendor list
router.route("/fetch/vendors").get(authorized, getBusinessLists);
// Get All Client list
router.route("/fetch/clients").get(authorized, fetchAllclients);
// Remove client
router.route("/remove/user/:id").delete(authorized, deleteSingleUser);
// Create Business
router.route("/create-business").post(authorized, roleauthor("admin"), createBusiness);
// Exporting router module
module.exports = router;
