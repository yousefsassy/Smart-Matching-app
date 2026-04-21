// config/connect.js
const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected To Database");
  })
  .catch((err) => {
    console.log("DB Connection Error:", err);
  });

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB:", mongoose.connection.name);
});

mongoose.connection.on("error", (err) => {
  console.log("Mongoose connection error:", err);
});

module.exports = mongoose;