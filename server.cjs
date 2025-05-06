const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const pool = require('./db.js');
const accountRoutes = require('./routes/accountRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup (Pug)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

// ✅ Use your account-related routes
app.use('/account', accountRoutes); // Use '/account' prefix for all account-related routes

// DATABASE TABLE CREATION
(async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Users (
                Email VARCHAR(100) PRIMARY KEY,
                First_Name VARCHAR(100),
                Last_Name VARCHAR(100),
                Country_Code VARCHAR(10),
                Phone_Number VARCHAR(20),
                Password_Hash VARCHAR(255),
                Verification_Code VARCHAR(100),
                Verified BOOLEAN DEFAULT FALSE,
                Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Users table created or already exists.");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS EmailVerifications (
                Email VARCHAR(100) PRIMARY KEY,
                VerificationCode VARCHAR(100),
                Verified BOOLEAN DEFAULT FALSE,
                CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ EmailVerifications table created or already exists.");
    } catch (err) {
        console.error("❌ Error setting up tables:", err);
    }
})();

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});