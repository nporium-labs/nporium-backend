const mongoose = require("mongoose"),
  crypto = require("crypto"),
  bcrypt = require("bcryptjs");
const { Super } = require("../utilities/roles");
userRoles = require("../utilities/roles");

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
  roles: {
    type: [Number],
    default: [2001],
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
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash("@Admin123", salt);
    const createUserObject = userObject({
      email: "admin@admin.com",
      firstName: "Super Admin",
      lastName: "Admin",
      password: hashedPass,
      imageUrl: "",
      roles: [1984, 5150],
      isActive: true,
    });
    const result = await createUserObject.save();
  }
};
userFind();
