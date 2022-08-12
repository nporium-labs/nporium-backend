const mongoose = require("mongoose"),
  crypto = require("crypto"),
  bcrypt = require("bcryptjs");

const userAccount = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const userObject = mongoose.model("userAccount", userAccount);

const userFind = async () => {
  let user = await userObject.findOne({
    email: "admin@admin.com",
  });
  if (!user || user == null) {
    const createUserObject = userObject({
      email: "admin@admin.com",
      firstName: "Super",
      lastName: "Admin",
      password: "admin123",
      imageUrl: "",
      isActive: true,
    });
    const result = await createUserObject.save();
  }
};
userFind();
