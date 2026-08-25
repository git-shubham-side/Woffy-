const mongoose = require("mongoose");

async function dbConnection() {
  try {
    await mongoose.connect(process.env.DBURL);
    console.log("Database Connected Sussfully!");
  } catch (err) {
    console.log("Database Connection Error!");
    console.log(err);
  }
}

module.exports = dbConnection;
