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

// Error Handling
app.use((req, res, next) => {
  const error = new Error('Page Not Found!')
  error.status = 404
  next(error)
})
app.use((error, req, res,next)=>{
  res.status(error.status || 500)
  res.json({
    error : error.message
  })
})

module.exports = app;
