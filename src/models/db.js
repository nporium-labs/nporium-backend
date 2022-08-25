const mongoose = require("mongoose");
const user = require("./login.Model");
const userPaswordTokens = require("./usersPasword");
require("dotenv").config();

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("connected to database");
  } catch (error) {
    console.log("could not connect to database", error);
    process.exit(1);
  }
};

connectDatabase();
