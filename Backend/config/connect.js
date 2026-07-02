const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  throw new Error("MONGO_URL is required");
}

const connectToDatabase = async () => {
  await mongoose.connect(MONGO_URL, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("Connected To Database");
};

module.exports = {
  connectToDatabase,
  mongoose,
};
