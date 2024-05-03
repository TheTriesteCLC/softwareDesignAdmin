//Settup app
const path = require("path");
const express = require("express");
require("dotenv").config();

const app = express();

const passport = require('passport');
require('./config/passport/passport')(passport);
const session = require('express-session');

//Settup hbs
const handleBars = require("express-handlebars");

//Setup session
const store = session.MemoryStore();
app.use(session({
  saveUninitialized: false,
  secret: "440457",
  cookie: {
    // maxAge: 1000 * 10 // 1s * 10
    maxAge: null // 1s * 10
  },
  store
}))

//Passport init
app.use(passport.initialize());
app.use(passport.session());

//Settup miscellanous
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");

//Init middlewares
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(morgan("dev")); // Change color status in terminal
// app.use(helmet()); // Hidden infomation of website
// app.use(helmet({
//   contentSecurityPolicy: {
//       directives: {
//           defaultSrc: ["'self'"],
//           scriptSrc: ["'self'", "'unsafe-inline'"],
//           styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
//           imgSrc: ["'self'", 'https://*.com'],
//           fontSrc: ["'self'", 'https://*.com', 'data:']
//       },
//   }
// }));
app.use(compression()); // Decrease load data

//Template engine
app.engine("hbs",handleBars.engine({
    extname: ".hbs",
    helpers: {
      json: (content) => JSON.stringify(content),
    },
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources", "views"));

//set up when using
//app.use('/static', express.static(`${__dirname}\\public`))
//Setup CSS
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../publicAdmin')));

//Set up JSON middleware for POST PUT
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json());

//Connect DB
require("./dbs/mongo.db");

//router
app.use("", require("./routers"));

//handle error
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal Server Error",
  });
});

app.get("/", (req, res) => {
  res.render("home");
});

module.exports = app;
