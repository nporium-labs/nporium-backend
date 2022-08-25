const express = require("express"),
  expressValidator = require("express-validator"),
  bodyParser = require("body-parser"),
  formData = require("express-form-data"),
  postmark = require("postmark"),
  fs = require("fs"),
  multer = require("multer"),
  cors = require("cors"),
  db = require("./src/models/db"),
  path = require("path");
loginroutes = require("./src/routes/loginRoutes");
require("dotenv").config();
const app = express();

const whitelist = [
  "https://vercel.com/danishismail/nft-store-frontend",
  "https://nft-store-frontend-nine.vercel.app",
  "http://localhost:3000",
  "https://nftmarketbackendapp.herokuapp.com",
];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors(corsOptions));

app.use(loginroutes);

const port = process.env.PORT || 5000;
app.listen(port, console.log(`running on port ${port}`));
