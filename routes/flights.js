const express = require("express");
const router = express.Router();
const Flight = require("../models/flight");

router.post("/add", async (req, res) => {
  const { flightNumber, departure, destination, date, time, seats } = req.body;

  const newFlight = new Flight({
    flightNumber,
    departure,
    destination,
    date,
    time,
    seats,
  });

  await newFlight.save();
  res.send("Flight added successfully!");
});

router.get("/delete/:flightNumber", async (req, res) => {
  const flightNumber = req.params.flightNumber;

  await Flight.deleteOne({ flightNumber });

  res.send("Flight removed successfully!");
});

// Search Flights
router.post("/search", async (req, res) => {
  const { departure, destination, date } = req.body;

  const selectedDate = new Date(date);
  const currentDate = new Date();

  if (selectedDate < currentDate) {
    // Invalid date selected
    res.render("flightsearch", {
      flights: [],
      searched: true,
      message: "Please select a valid date.",
    });
    return;
  }

  // Query flights based on the departure, destination, and date
  const flights = await Flight.find({ departure, destination, date });

  res.render("flightsearch", { flights, searched: true });
});

module.exports = router;
