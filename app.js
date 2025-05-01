const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session"); // For session management
const { createAccount, verifyAccount } = require('./controllers/accountController.js'); // Import your account controller

const app = express();
const port = 3000;

// Middleware for parsing incoming form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// Set up the view engine (using Pug)
app.set('view engine', 'pug');
app.set('views', './views');

// Setup session
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true
}));

app.get("/", (req, res) => {
  res.render('index');
});

app.get('/:page', (req, res) => {
  const page = req.params.page;
  res.render(page);  // Will render a Pug template with the same name as the URL
});

// Route to handle Create Account form
app.post('/createAccountForm', createAccount);  // Use the controller method here

// Route to handle Account verification
app.post('/verifyAccount', verifyAccount);  // Use the controller method for verification

// Start the server
app.listen(port, () => {
  console.log(`Running Software Engineering Project Group 113 on PORT ${port}`);
});
