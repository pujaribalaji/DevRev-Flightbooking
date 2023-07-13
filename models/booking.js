const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  flightNumber: String,
  time: String,
  seats: Number,
  username: String,
});

module.exports = mongoose.model("Booking", bookingSchema);
