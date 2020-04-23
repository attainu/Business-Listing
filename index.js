// Requiring NPM Modules
const [express, path, fs, dotenv, mongoose, morgan, cookieParser, sanitize, helmet, xss, rateLimit, hpp, compression] = [
  require("express"),
  require("path"),
  require("fs"),
  require("dotenv").config(),
  require("mongoose"),
  require("morgan"),
  require('cookie-parser'),
  require('express-mongo-sanitize'),
  require('helmet'),
  require('xss-clean'),
  require('express-rate-limit'),
  require('hpp'),
  require('compression')
];

// Initializing App variable
const app = express();

// Adding Express Middleware Functions
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser())
app.use(sanitize())
app.use(helmet())
app.use(xss())
app.use(hpp())
app.use(compression())
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);


// Fixing cors errors problems
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "Options") {
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, DELETE, POST");
    return res.status(200).json({});
  }
  next();
});

// Adding Custom Middlewares
app.use(
  "/api/v1/business/",
  require(path.join(__dirname, "routes", "vendors"))
);
app.use(
  "/api/v1/services",
  require(path.join(__dirname, "routes", "services"))
);
app.use("/api/v1/users", require(path.join(__dirname, "routes", "users")));
app.use(
  "/api/v1/users/verify_email",
  require(path.join(__dirname, "routes", "verifyEmail"))
);
app.use('/api/v1/admin', require(path.join(__dirname, 'routes', 'admin')))
// app.use('/', require(path.join(__dirname, 'routes', 'index')))

// Error Handling
app.use((req, res, next) => {
  const error = new Error("Page Not Found!");
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: error.message
  });
});

module.exports = app;
