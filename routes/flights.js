const express = require("express");
const router = express.Router();
const Flight = require("../models/flight");

// Add a new flight
router.post("/add", async (req, res) => {
  try {
    const { flightNumber, departure, destination, date, time, seats } =
      req.body;

    const newFlight = new Flight({
      flightNumber,
      departure,
      destination,
      date,
      time,
      seats,
    });

    await newFlight.save();
    res.send(
      "<script>alert('Flight added successfully!'); window.history.back();</script>"
    );
  } catch (error) {
    res.status(500).send("An error occurred while adding the flight.");
  }
});

// Delete a flight by flightNumber
router.get("/delete/:flightNumber", async (req, res) => {
  try {
    const flightNumber = req.params.flightNumber;

    await Flight.deleteOne({ flightNumber });

    res.send("Flight removed successfully!");
  } catch (error) {
    res.status(500).send("An error occurred while deleting the flight.");
  }
});

// Search Flights
router.post("/search", async (req, res) => {
  try {
    const { departure, destination, date } = req.body;

    const selectedDate = new Date(date);
    const currentDate = new Date();

    if (selectedDate < currentDate) {
      return res.render("flightsearch", {
        flights: [],
        searched: true,
        message: "Please select a valid date.",
      });
    }

    // Query flights based on the departure, destination, and date
    const flights = await Flight.find({
      departure: { $regex: new RegExp(departure, "i") },
      destination: { $regex: new RegExp(destination, "i") },
      date: { $gte: selectedDate },
    });

    res.render("flightsearch", { flights, searched: true });
  } catch (error) {
    res.status(500).send("An error occurred while searching for flights.");
  }
});

module.exports = router;
