import express from "express";
import path from "path";
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const port = 3000;

// Find file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware for parsing incoming form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// Set up the view engine (if you are using EJS, Pug, etc.)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Route to the home page
app.get("/", (req, res) => {
  res.render("index");
});

// Route for the Create Account form
app.get('/createAccount', (req, res) => {
  res.render('createAccount');
});

// Handle POST request from the Create Account form
app.post('/createAccountForm', (req, res) => {
  const { email, confirmEmail, password, confirmPassword, tos } = req.body;

  // Validation
  if (email !== confirmEmail) {
    return res.send('Emails do not match!');
  }

  if (password !== confirmPassword) {
    return res.send('Passwords do not match!');
  }

  if (!tos) {
    return res.send('You must accept the terms and conditions!');
  }

  // Handle form data
  // Create Confirmation Response
  res.send(`Account created for ${email}!`);
});

// Start the server
app.listen(port, () => {
console.log(`Running Software Engineering Project Group 113 on PORT ${port}`);
});