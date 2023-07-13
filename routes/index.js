const express = require("express");
const router = express.Router();
const Flight = require("../models/flight");

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/adminprofile", async (req, res) => {
  try {
    // Fetch the flights from the database
    const flights = await Flight.find();

    // Render the adminprofile.ejs file
    res.render("adminprofile", { flights });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
