const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session');

const port = process.env.PORT || 3000;

const loginRouter = require('./routes/loginRouter');
const signUpRouter = require('./routes/signUpRouter');
const logoutRouter = require('./routes/logoutRouter');

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

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get("/create-account", (req, res) => {
  res.render("create-account");
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', { user: req.session.user });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
