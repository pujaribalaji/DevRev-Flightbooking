const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Flight = require("../models/flight");
const Booking = require("../models/booking");
const bcrypt = require("bcrypt");

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", async (req, res) => {
  const { username, password, isAdmin } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    res.send("User already exists!");
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = new User({
    username,
    password: hashedPassword,
    isAdmin: isAdmin === "on",
  });

  await newUser.save();
  res.redirect("/login");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Find the user
  const user = await User.findOne({ username });
  if (!user) {
    res.send("User not found!");
    return;
  }

  // Compare passwords
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    res.send("Incorrect password!");
    return;
  }

  // Store user data in session
  req.session.user = {
    username: user.username,
    isAdmin: user.isAdmin,
  };

  if (user.isAdmin) {
    res.redirect("/adminprofile");
  } else {
    res.redirect("/profile");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

router.get("/profile", async (req, res) => {
  if (!req.session.user) {
    res.redirect("/login");
    return;
  }

  const { username } = req.session.user;

  // Fetch flights for the user
  const flights = await Flight.find();

  // Fetch bookings for the user
  const bookings = await Booking.find({ username });

  res.render("profile", { username, flights, bookings });
});

router.get("/profile/mybookings", async (req, res) => {
  if (!req.session.user) {
    res.redirect("/login");
    return;
  }

  const { username } = req.session.user;

  // Fetch bookings for the user
  const bookings = await Booking.find({ username });

  res.render("mybooking", { username, bookings });
});

module.exports = router;
