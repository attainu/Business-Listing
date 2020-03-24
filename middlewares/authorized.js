const [path, jwt] = [require("path"), require("jsonwebtoken")];

const User = require(path.join(__dirname, "..", "models", "clientAccountDB"));

module.exports = async (req, res, next) => {
  try {
    let authToken = req.header("Authorization");
    if (!authToken) {
      return res.json({ error: "No vaild user exists" });
    } else {
      const user = await User.findOne({ token: authToken });
      if (!user) {
        return res.json({ error: "No Valid Token Exists." });
      } else {
        req.user = user;
        next();
      }
    }
  } catch (error) {
    next(error);
  }
};
