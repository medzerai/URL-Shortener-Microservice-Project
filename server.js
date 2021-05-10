require("dotenv").config({ path: "./sample.env" });
const { URL, parse } = require("url");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
try {
  mongoose = require("mongoose");
} catch (e) {
  console.log(e);
}
const app = express();
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

const Url = require("./myApp.js").urlModel;

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

const stringIsAValidUrl = (s, protocols) => {
  try {
    new URL(s);
    const parsed = parse(s);
    return protocols
      ? parsed.protocol
        ? protocols.map((x) => `${x.toLowerCase()}:`).includes(parsed.protocol)
        : false
      : true;
  } catch (err) {
    return false;
  }
};

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

const findByshorturl = require("./myApp.js").findByshorturl;
app.get("/api/shorturl/:surl", (req, res) => {
  let u = Number(req.params.surl);
  Url.countDocuments({ short_url: u }, function (error, n) {
    if (n == 0) {
      res.json({ error: "Wrong format" });
    } else {
      findByshorturl(u, (err, data) => {
        if (err) {
          return next(err);
        }
        if (!data) {
          console.log("Missing `done()` argument");
          return next({ message: "Missing callback argument" });
        }
        res.redirect(data[0].original_url);
      });
    }
  });
});

const addoriginalurl = require("./myApp.js").addoriginalurl;
app.post("/api/shorturl", function (req, res) {
  let u = req.body.url;
  if (stringIsAValidUrl(u, ["http", "https"])) {
    Url.countDocuments({ original_url: u }, function (error, n) {
      if (n == 0) {
        addoriginalurl(u, function (err, data) {
          if (err) {
            return next(err);
          }
          if (!data) {
            console.log("Missing `done()` argument");
            return next({ message: "Missing callback argument" });
          }
          Url.find({ original_url: u }, function (err, urls) {
            if (err) {
              return next(err);
            }
            res.json({
              original_url: urls[0].original_url,
              short_url: urls[0].short_url,
            });
          });
        });
      } else {
        Url.find({ original_url: u }, function (err, urls) {
          if (err) {
            return next(err);
          }
          res.json({
            original_url: urls[0].original_url,
            short_url: urls[0].short_url,
          });
        });
      }
    });
  } else {
    res.json({ error: "invalid url" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
