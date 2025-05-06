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

app.get('/', async (req, res) => {
    try {
        const data = await pool.query(
            'SELECT * FROM Users')

        res.status(200).send(data.rows);
    } catch (error) {
        console.log(error);
        res.status(500)
    }
});

// DATABASE TABLE CREATION (Moved to '/setup' route)
app.get('/setup', async (req, res) => {
    try {
        // Create Users table
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
                Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                Is_Admin BOOLEAN DEFAULT FALSE,
                Is_Banned BOOLEAN DEFAULT FALSE,
                License_Number VARCHAR(100),
                Balance DECIMAL(10, 2) DEFAULT 0.00
            );
        `);
        console.log("✅ Users table created or already exists.");
        // Create Bookings table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Bookings(
                BookingID SERIAL PRIMARY KEY,
                Location VARCHAR(255) NOT NULL,
                SpaceNumber INT NOT NULL,
                isBlocked BOOLEAN DEFAULT FALSE,
                Date DATE NOT NULL,
                Time TIME NOT NULL,
                isVerified BOOLEAN DEFAULT FALSE
            )
        `);

        // Create ParkingLots table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ParkingLots(
                LotID SERIAL PRIMARY KEY,
                Capacity INT NOT NULL
            )
        `);

        // Create EmailVerifications table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS EmailVerifications (
                Email VARCHAR(100) PRIMARY KEY,
                VerificationCode VARCHAR(100),
                Verified BOOLEAN DEFAULT FALSE,
                CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ EmailVerifications table created or already exists.");

        res.status(200).send('✅ Database tables are set up successfully!');
    } catch (error) {
        console.error('Database setup error:', error);
        res.status(500).send('Failed to create tables: ' + error.message);
    }
});

// INSERT DATA INTO Users
app.post('/insert', async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone_number, country_code, verification_code, is_admin, is_banned, license_number, balance } = req.body.user;

        // Insert into Users table
        await pool.query(`
            INSERT INTO Users (
                First_Name, Last_Name, Email, Password_Hash, Phone_Number, Country_Code, 
                Verification_Code, Verified, Is_Admin, Is_Banned, License_Number, 
                Balance
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, FALSE, $8, $9, $10, $11
            );
        `, [
            first_name, 
            last_name, 
            email, 
            password, 
            phone_number, 
            country_code, 
            verification_code, 
            is_admin, 
            is_banned, 
            license_number, 
            balance
        ]);

        console.log("✅ User inserted successfully.");
        res.status(201).send('✅ User inserted successfully.');
    } catch (error) {
        console.error('Error inserting user:', error);
        res.status(500).send('Failed to insert user: ' + error.message);
    }
});

app.post('/clear', async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM Users *'
        )
        res.status(200).send('cleared');
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}
);

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
