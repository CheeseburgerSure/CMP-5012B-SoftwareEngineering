const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session');

// Load environment variables from the .env file
require('dotenv').config();

const port = process.env.PORT || 3000;  // Use the port from the .env file or default to 3000
const sessionSecret = process.env.SESSION_SECRET;  // Use the session secret from the .env file

// Routers
const loginRouter = require('./routes/loginRouter');
const signUpRouter = require('./routes/signUpRouter');
const logoutRouter = require('./routes/logoutRouter');
const authRoutes = require('./routes/authRouter');
const dashboardRouter = require('./routes/dashboardRouter');
const detailsRouter = require('./routes/detailRouter');
const balanceRouter = require('./routes/balanceRouter');
const adminRouter = require('./routes/adminRouter');
const forgotRouter = require('./routes/forgotRouter');
const resetRouter = require('./routes/resetRouter');
const reserveRouter = require('./routes/reserveRouter');
const paymentRouter = require('./routes/paymentRouter');

// Set views and view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
  secret: sessionSecret,  // Use the session secret from .env
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.use('/', loginRouter);
app.use('/', signUpRouter);
app.use(logoutRouter);
app.use('/', authRoutes);
app.use('/dashboard', dashboardRouter);
app.use('/details', detailsRouter);
app.use('/', balanceRouter);
app.use('/', adminRouter);
app.use('/', forgotRouter);
app.use('/', resetRouter);
app.use('/', reserveRouter);
app.use('/', paymentRouter);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.get("/create-account", (req, res) => {
  res.render("create-account");
});

// Start the server
const server = app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port} 🚀`);
});

module.exports = server;