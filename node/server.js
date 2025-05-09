const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session');

const port = process.env.PORT || 3000;

// Routers
const loginRouter = require('./routes/loginRouter');
const signUpRouter = require('./routes/signUpRouter');
const logoutRouter = require('./routes/logoutRouter');
const authRoutes = require('./routes/authRoutes');

// Set views and view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
    secret: 'your-secret-key',  // Replace with a strong secret in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }  // Set to true if using HTTPS
}));


app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

// Use routers for login and sign-up with specific routes
app.use('/', loginRouter);  // Handles routes like /login
console.log("✅ loginRouter mounted");
app.use('/', signUpRouter);  // Handles routes like /createAccountForm
console.log("✅ signUpRouter mounted");
app.use(logoutRouter);
app.use('/', authRoutes);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get("/create-account", (req, res) => {
  res.render("create-account");
});

// Dashboard route (only accessible if the user is logged in)
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Redirect to login if the user is not logged in
  }
  res.render('dashboard', { user: req.session.user }); // Pass user data to dashboard
});


// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port} 🚀`);
});