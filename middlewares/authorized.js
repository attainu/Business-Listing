const [path, jwt] = [require("path"), require("jsonwebtoken")];

const User = require(path.join(__dirname, "..", "models", "clientAccountDB"));

module.exports = async (req, res, next) => {
  try {
    let authToken = req.header("Authorization");
    // if (!authToken) {
    //   return res.json({ error: "No vaild Token exists" });
    // } else {
    //   const user = await User.findOne({ token: authToken });
    //   if (!user) {
    //     return res.json({ error: "No Valid user Exists with this Token." });
    //   } else {
    //     req.user = user;
    //     next();
    //   }
    // }

    if (authToken) {
      const user = await User.findOne({ token: authToken });
      if (!user) {
        return res.json({ error: "No valid user with this Token" });
      } else {
        await jwt.verify(user.token, "sriksha");
        req.user = user;
        next();
      }
    } else {
      res.json({ error: "No valid Token exists" });
    }
  } catch (error) {
    next(error);
  }
};
