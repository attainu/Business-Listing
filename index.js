// Requiring NPM Modules
const [express, path, fs, dotenv, mongoose] = [
  require("express"),
  require("path"),
  require("fs"),
  require("dotenv").config(),
  require("mongoose")
];

// Initializing App variable
const app = express();

// Adding Express Middleware Functions
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Adding Custom Middlewares
app.use("/users", require(path.join(__dirname, "routes", "users")));
app.use('/admin', require(path.join(__dirname, 'routes','admin', 'admin')))
app.use(
  "/verifyEmail",
  require(path.join(__dirname, "routes", "common", "verifyEmail"))
);

module.exports = app;
