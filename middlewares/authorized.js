const [path, jwt, dotenv] = [
  require("path"),
  require("jsonwebtoken"),
  require("dotenv").config()
];

// Mongoose collections paths
const User = require(path.join(__dirname, "..", "models", "Users"));
const async = require(path.join(
  __dirname,
  "..",
  "middlewares",
  "asyncHandler"
));
exports.authorized = async(async (req, res, next) => {
  var token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: `You're not authorized` });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, error: `You're not authorized ${err}` });
  }
});

exports.roleauthor = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          success: false,
          error: `You're not authorized to perform this action`
        });
    }
    next();
  };
};
