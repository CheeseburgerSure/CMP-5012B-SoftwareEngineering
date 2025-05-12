const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const favicon = require("serve-favicon");
const fs = require("fs");
const { execSync } = require("child_process");

const app = express();
const port = 3000;

// Get Git branch name
let branchName = 'unknown';
try {
  branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
} catch (error) {
  console.error('Could not get branch name:', error.message);
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// View engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Session
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true
}));

// Basic routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/create-account", (req, res) => {
  res.render("create-account");
});

app.get("/verify", (req, res) => {
  res.render("verify");
});

// Handle form POST
app.post("/createAccountForm", postRegister);

// Dynamic page fallback (optional)
app.get("/:page", (req, res, next) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, 'views', `${page}.pug`);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return next();
    res.render(page);
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render("404");
});

// Start server
app.listen(port, () => {
  console.log(`Running Software Engineering Project Group 113 on PORT ${port}`);
  console.log(`This is Branch ${branchName}`);
});
