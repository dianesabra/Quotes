var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var PORT = 3000 || process.env.PORT;
var app = express();
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/chron";

mongoose.connect(MONGODB_URI);

app.get("/scrape", function(req, res) {
  axios.get("http://quotes.toscrape.com/").then(function(response) {
    var $ = cheerio.load(response.data);
    $(".quote").each(function(i, element) {
      var result = {};
      result.headline = $(this)
        .children("span.text")
        .text();
      result.url =
        "http://quotes.toscrape.com/" +
        $(this)
          .children("span")
          .children("a")
          .attr("href");
      result.summary = $(this)
        .children("span")
        .children("small")
        .text();
      db.Quote.create(result)
        .then(function(dbQuote) {
          console.log(dbQuote);
        })
        .catch(function(err) {
          console.log(err);
        });
    });
    res.send("Scrape Complete");
  });
});

app.get("/quotes", function(req, res) {
  db.Quote.find({})
    .then(function(dbQuote) {
      res.json(dbQuote);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/quotes/:id", function(req, res) {
  db.Quote.findOne({ _id: req.params.id })
    .populate("comment")
    .then(function(dbQuote) {
      res.json(dbQuote);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/quotes/:id", function(req, res) {
  db.Comment.create(req.body)
    .then(function(dbComment) {
      return db.Quote.findOneAndUpdate(
        { _id: req.params.id },
        { comment: dbComment._id },
        { new: true }
      );
    })
    .then(function(dbQuote) {
      res.json(dbQuote);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
