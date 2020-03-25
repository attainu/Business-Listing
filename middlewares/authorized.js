const [path, jwt] = [require("path"), require("jsonwebtoken")];

// Mongoose collections paths
const User = require(path.join(__dirname, "..", "models", "clientAccountDB"));
const Vendor = require(path.join(__dirname, "..", "models", "vendorAccountDB"));
const Admin = require(path.join(__dirname, "..", "models", "adminAccountDB"));

module.exports = async (req, res, next) => {
  let authToken = req.header("Authorization");
  // Checking admin token validation
  if (req.url === "/logout") {
    try {
      if (authToken) {
        const user = await Admin.findOne({ token: authToken });
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
  }

  // Checking client token validation
  if (req.url === "/client/logout") {
    try {
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
  }

  // Checking vendor token validation
  if (req.url === "/vendor/logout") {
    try {
      if (authToken) {
        const user = await Vendor.findOne({ token: authToken });
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
  }
};
