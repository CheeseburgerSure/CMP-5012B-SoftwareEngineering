const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session"); // For session management
const { postRegister, verifyAccount } = require('./controllers/accountController.js'); // Import your account controller

const app = express();
const port = 3000;

// Get the current Git branch name
let branchName = 'unknown';
try {
  branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
} catch (error) {
  console.error('Could not get branch name:', error.message);
}

// Find file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// View engine
app.set('view engine', 'pug');
app.set('views', './views');

// Session
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true
}));

// Routes
app.get("/", (req, res) => {
  res.render('index');
});

app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, 'views', `${page}.pug`);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return next();
    }
    res.render(page);
  });
});

// Route to handle Create Account form
app.post('/createAccountForm', postRegister);  // Use the controller method here


// 404
app.use((req, res) => {
  res.status(404).render('404');
});

// Start the server
app.listen(port, () => {
  console.log(`Running Software Engineering Project Group 113 on PORT ${port}`);
  console.log(`This is Branch ${branchName}`);
});
