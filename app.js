const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const indexRoutes = require("./routes/index");
const flightRoutes = require("./routes/flights");
const bookingRoutes = require("./routes/bookings");
const authRoutes = require("./routes/auth");
const Flight = require("./models/flight");
require("dotenv").config(); // Add this line to load environment variables

const app = express();
const port = 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  // Use the MongoDB URI from environment variable
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret-key",
    resave: true,
    saveUninitialized: true,
  })
);

// Set EJS as the view engine
app.set("view engine", "ejs");

// Routes
app.use("/", indexRoutes);
app.use("/flights", flightRoutes);
app.use("/bookings", bookingRoutes);
app.use("/", authRoutes);

// Serve static files from the "public" directory
app.use(express.static("public"));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
