const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://pujaribalaji152:Balaji152@cluster0.gdseb2f.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

// Define User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  isAdmin: Boolean,
});

const User = mongoose.model('User', userSchema);

// Define Flight schema
const flightSchema = new mongoose.Schema({
  flightNumber: String,
  departure: String,
  destination: String,
  date: Date,
  time: String,
  seats: Number,
});

const Flight = mongoose.model('Flight', flightSchema);

// Define Booking schema
const bookingSchema = new mongoose.Schema({
  flightNumber: String,
  time: String,
  seats: Number,
  username: String, // Add the username field to the booking schema
});

const Booking = mongoose.model('Booking', bookingSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: 'secret-key',
    resave: true,
    saveUninitialized: true,
  })
);

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Add Flight
app.post('/flights/add', async (req, res) => {
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
  res.send('Flight added successfully!');
});

// User Bookings
app.get('/profile/mybookings', async (req, res) => {
    if (!req.session.user) {
      res.redirect('/login');
      return;
    }
  
    const { username } = req.session.user;
  
    // Fetch bookings for the user
    const bookings = await Booking.find({ username });
  
    const bookingStatus = req.query.booking; // Get the booking status from the query parameter
  
    res.render('mybooking', { username, bookings, booking: bookingStatus }); // Pass the booking status to the view
});

  


// Delete Flight
app.get('/flights/delete/:flightNumber', async (req, res) => {
  const flightNumber = req.params.flightNumber;

  await Flight.deleteOne({ flightNumber });

  res.send('Flight removed successfully!');
});

// Add Booking
app.post('/bookings/add', async (req, res) => {
  const { flightNumber, time } = req.body;

  const newBooking = new Booking({
    flightNumber,
    time,
    seats: 1,
    username: req.session.user.username, // Get the username from the session
  });

  await newBooking.save();
  res.redirect('/profile/mybookings?booking=success');
});

  // Delete Booking
  // Delete Booking
app.post('/bookings/delete', async (req, res) => {
    const { flightNumber, time } = req.body;
    const { username } = req.session.user;
  
    await Booking.deleteOne({ flightNumber,  username });
  
    res.redirect('/profile/mybookings?booking=success');
  });
  
// Routes
app.get('/adminprofile', async (req, res) => {
  // Fetch the flights from the database
  const flights = await Flight.find();

  // Render the adminprofile.ejs file
  res.render('adminprofile', { flights });
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { username, password, isAdmin } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    res.send('User already exists!');
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = new User({
    username,
    password: hashedPassword,
    isAdmin: isAdmin === 'on', // Convert the value to a boolean
  });

  await newUser.save();
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find the user
  const user = await User.findOne({ username });
  if (!user) {
    res.send('User not found!');
    return;
  }

  // Compare passwords
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    res.send('Incorrect password!');
    return;
  }

  // Store user data in session
  req.session.user = user;

  if (user.isAdmin) {
    res.redirect('/adminprofile');
  } else {
    res.redirect('/profile');
  }
});

app.get('/profile', async (req, res) => {
  if (!req.session.user) {
    res.redirect('/login');
    return;
  }

  const { username } = req.session.user;

  // Fetch flights for the user
  const flights = await Flight.find();

  // Fetch bookings for the user
  const bookings = await Booking.find({ username });

  res.render('profile', { username, flights, bookings });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Flights Route
app.post('/profile/flights/search', async (req, res) => {
  const { departure, destination, date } = req.body;

  // Query flights based on the departure, destination, and date
  const flights = await Flight.find({ departure, destination, date });

  res.render('flightsearch', { flights, searched: true });
});

// Serve static files from the "public" directory
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});