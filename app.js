const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

mongoose.connect("mongodb+srv://1:1@signup.gxcneko.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

const User = mongoose.model("User", userSchema);

router.post("/signup", function (req, res) {
  const user = new User({
    email: req.body.email,
    password: req.body.password,
  });

  user.save(function (err) {
    if (err) return res.status(500).send(err);
    res.send("User created successfully");
  });
});

router.post("/signin", function (req, res) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return res.status(500).send(err);
    if (!user) return res.status(404).send("No user found");

    bcrypt.compare(req.body.password, user.password, function (err, result) {
      if (err) return res.status(500).send(err);
      if (!result) return res.status(401).send("Password is incorrect");

      // Add session management here
      res.send("User logged in successfully");
    });
  });
});

module.exports = router;
