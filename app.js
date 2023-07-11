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
  
  // Delete Flight
  app.get('/flights/delete/:flightNumber', async (req, res) => {
    const flightNumber = req.params.flightNumber;
  
    await Flight.deleteOne({ flightNumber });
  
    res.send('Flight removed successfully!');
  });
  
  // Add Booking
  app.post('/bookings/add', async (req, res) => {
    const { flightNumber, time, seats } = req.body;
  
    const newBooking = new Booking({
      flightNumber,
      time,
      seats,
    });
  
    await newBooking.save();
    res.send('Booking added successfully!');
  });
  
  // Delete Booking
  app.get('/bookings/delete/:flightNumber/:time', async (req, res) => {
    const flightNumber = req.params.flightNumber;
    const time = req.params.time;
  
    await Booking.deleteOne({ flightNumber, time });
  
    res.send('Booking removed successfully!');
  });
  

// Routes
app.get('/adminprofile', async(req, res) => {
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
      isAdmin: isAdmin || false, // Set isAdmin based on user input (default: false)
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
      res.redirect('/admin/home');
    } else {
      res.redirect('/profile');
    }
  });
  

app.get('/profile', (req, res) => {
  if (!req.session.user) {
    res.redirect('/login');
    return;
  }

  const { username } = req.session.user;
  res.render('profile', { username });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Add Flights by Admin
app.get('/admin/flights/add', (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    res.redirect('/admin/login');
    return;
  }

  res.render('add-flight');
});

app.post('/admin/flights/add', async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    res.send('Access denied');
    return;
  }

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

// Remove Flights by Admin
app.get('/admin/flights/remove/:flightNumber', async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    res.send('Access denied');
    return;
  }

  const flightNumber = req.params.flightNumber;

  await Flight.deleteOne({ flightNumber });

  res.send('Flight removed successfully!');
});

// View Bookings based on Flight Number and Time
app.get('/bookings', async (req, res) => {
  const { flightNumber, time } = req.query;

  const bookings = await Booking.find({ flightNumber, time });

  res.render('booking-list', { bookings });
});

// Serve static files from the "public" directory
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
