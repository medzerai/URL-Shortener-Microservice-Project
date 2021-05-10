require("dotenv").config({ path: "./sample.env" });
const mongoose = require("mongoose");
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url: String,
  short_url: Number,
});

let Url = mongoose.model("URL", urlSchema);

const findByshorturl = (surl, done) => {
  Url.find({ short_url: surl }, (err, docs) => {
    if (err) return console.error(err);
    done(null, docs);
  });
};

const addoriginalurl = (ourl, done) => {
  Url.countDocuments({}, function (error, n) {
    let o = new Url({
      original_url: ourl,
      short_url: n,
    });
    o.save((err, data) => {
      if (err) return console.error(err);
      done(null, data);
    });
  });
};

exports.urlModel = Url;
exports.findByshorturl = findByshorturl;
exports.addoriginalurl = addoriginalurl;
