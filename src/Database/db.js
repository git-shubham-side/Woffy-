const mongoose = require("mongoose");

async function dbConnection() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/Woffy");
    console.log("Database Connected Sussfully!");
  } catch (err) {
    console.log("Database Connection Error!");
    console.log(err);
  }
}

module.exports = dbConnection;
