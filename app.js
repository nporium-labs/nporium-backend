const express = require("express"),
  expressValidator = require("express-validator"),
  bodyParser = require("body-parser"),
  formData = require("express-form-data"),
  proxy = require("http-proxy-middleware"),
  db = require("./src/models/db"),
  loginroutes = require("./src/routes/loginRoutes");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(formData.parse());
app.use(loginroutes);

const port = process.env.PORT || 5000;
app.listen(port, console.log(`running on port ${port}`));
