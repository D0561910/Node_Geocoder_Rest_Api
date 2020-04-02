var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var nodeGeocoder = require("node-geocoder");
var rateLimit = require("express-rate-limit");

var app = express();

var index = require("./routes/index");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", index);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 10000 // limit each IP to 1000 requests per windowMs
});

//  apply to all requests
app.use(limiter);

app.post("/api/geocoder/coordinate", (request, response) => {
  var lati = `${request.body.latitude}`;
  var long = `${request.body.longitude}`;
  if (lati.trim() === "" || long.trim() === "")
    response.json({ error: "Invaild format !!!" });
  let options = {
    provider: "openstreetmap"
  };

  let geoCoder = nodeGeocoder(options);

  geoCoder
    .reverse({
      lat: lati,
      lon: long
    })
    .then(res => {
      response.json({ res });
    })
    .catch(err => {
      response.json({ err });
    });
});

app.post("/api/geocoder/address", (request, response) => {
  var addr = `${request.body.address}`;
  if (addr.trim() === "") response.json({ error: "Invaild Address !!!" });
  let options = {
    provider: "openstreetmap"
  };

  let geoCoder = nodeGeocoder(options);

  geoCoder
    .geocode( addr )
    .then(res => {
      response.json({ res });
    })
    .catch(err => {
      response.json({ err });
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
