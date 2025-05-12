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
const authRoutes = require('./routes/authRouter');
const dashboardRouter = require('./routes/dashboardRouter');
const detailsRouter = require('./routes/detailRouter');

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
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});
app.use('/', loginRouter)
app.use('/', signUpRouter);
app.use(logoutRouter);
app.use('/', authRoutes);
app.use('/dashboard', dashboardRouter);
app.use('/', detailsRouter);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.get("/create-account", (req, res) => {
  res.render("create-account");
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port} 🚀`);
});