import express from "express";
import path from "path";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";
import session from "express-session"; // For session management
import favicon from "serve-favicon"; // NEW: Import serve-favicon
import { createAccount, verifyAccount } from './controllers/accountController.js'; // Import your account controller
import fs from 'fs'; // Add this to check for file existence

const app = express();
const port = 3000;

// Find file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware for parsing incoming form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// Serve favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Set up the view engine (using Pug)
app.set('view engine', 'pug');
app.set('views', './views');

// Setup session
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true
}));

// Routes
app.get("/", (req, res) => {
  res.render('index');
});

// Route to handle dynamic page requests
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, 'views', `${page}.pug`);

  // Check if the requested .pug file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return next(); // Pass to 404 handler if file doesn't exist
    }
    res.render(page); // Render the requested page if it exists
  });
});

// Route to handle Create Account form
app.post('/createAccountForm', createAccount);

// Route to handle Account verification
app.post('/verifyAccount', verifyAccount);

// 404 Handler (MAKE SURE THIS IS AT THE END)
app.use((req, res) => {
  res.status(404).render('404'); // Render the 404.pug page
});

// Start the server
app.listen(port, () => {
  console.log(`Running Software Engineering Project Group 113 on PORT ${port}`);
});
