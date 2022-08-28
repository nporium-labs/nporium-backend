const express = require("express"),
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

var corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3000/*",
    "https://nft-store-frontend-nine.vercel.app",
    "https://nft-store-frontend-nine.vercel.app/*",
    "https://nftmarketbackendapp.herokuapp.com",
    "https://nftmarketbackendapp.herokuapp.com/*",
  ],
  credentials: false,
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors(corsOptions));
app.use(loginroutes);

const port = process.env.PORT || 5000;
app.listen(port, console.log(`running on port ${port}`));
