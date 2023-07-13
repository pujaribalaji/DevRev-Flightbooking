const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
  flightNumber: String,
  departure: String,
  destination: String,
  date: Date,
  time: String,
  seats: Number,
});

module.exports = mongoose.model("Flight", flightSchema);
