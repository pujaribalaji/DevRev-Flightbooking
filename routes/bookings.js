const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");

router.post("/add", async (req, res) => {
  const { flightNumber, time } = req.body;
  const { username } = req.session.user;

  // Check if the flight is already booked
  const existingBooking = await Booking.findOne({ flightNumber, username });
  if (existingBooking) {
    res.json({ success: false, message: "Flight already booked!" });
    return;
  }

  const newBooking = new Booking({
    flightNumber,
    time,
    seats: 1,
    username: req.session.user.username,
  });

  await newBooking.save();
  res.json({ success: true });
});

router.post("/delete", async (req, res) => {
  const { flightNumber, time } = req.body;
  const { username } = req.session.user;

  await Booking.deleteOne({ flightNumber, username });

  res.redirect("/profile/mybookings?booking=success");
});

module.exports = router;
