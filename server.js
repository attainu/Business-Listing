// Importing npm modules
const [mongoose, path, dotenv] = [
  require("mongoose"),
  require("path"),
  require("dotenv").config()
];

// Importing app module from index.js
const app = require(path.join(__dirname, "index"));

// Environment Variables
const { PORT, MONGODB_URI, MONGODB_PASS } = process.env;

// Mongoose Connection
mongoose
  .connect(MONGODB_URI.replace("<password>", MONGODB_PASS), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex : true
  })
  .then(() => {
    console.log("DB Connected Successfully!!!");
    // Listening Port
    app.listen(PORT, () => console.log(`Server Connected At Port ${PORT}`));
  })
  .catch(err => console.log(err));
