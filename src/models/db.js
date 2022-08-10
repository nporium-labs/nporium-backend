const mongoose = require("mongoose");
const user = require("./login.Model");

const connectDatabase = async () => {
  try {
    await mongoose.connect(DB);
    console.log("connected to database");
  } catch (error) {
    console.log("could not connect to database", error);
    process.exit(1);
  }
};

connectDatabase();
