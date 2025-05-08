const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const pool = require('./db.js');
const accountRoutes = require('./routes/accountRoutes');
const loginRoutes = require('./routes/loginRoutes');
const loginController = require('./controllers/loginController'); // Assuming you have this controller

const app = express();
const PORT = process.env.PORT || 3000;

const bcrypt = require('bcryptjs');
const plainPassword = '123'; // ADMIN PASSWORD

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup (Pug)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Routes
app.get('/', async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM Users');
        res.render('index', { users: data.rows }); // Pass users data if necessary
    } catch (error) {
        console.log(error);
        res.status(500).send('Error retrieving users.');
    }
});

// Use your account-related routes
app.use('/account', accountRoutes);

// Use the login routes
app.use('/login', loginRoutes);

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
                Code_Expires_At TIMESTAMP,
                Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                Is_Admin BOOLEAN DEFAULT FALSE,
                Is_Banned BOOLEAN DEFAULT FALSE,
                License_Number VARCHAR(100),
                Balance DECIMAL(10, 2) DEFAULT 0.00
            );
        `);
        console.log("✅ Users table created or already exists.");
        
        // Create other necessary tables (Bookings, ParkingLots, EmailVerifications)

        // Check if the admin user already exists
        const adminResult = await pool.query('SELECT * FROM Users WHERE Email = $1', ['parkflow113@gmail']);
        
        if (adminResult.rows.length === 0) {
            // Hash the plain password using bcrypt
            const hashedPassword = await bcrypt.hash(plainPassword, 10);  // Salt rounds = 10

            // Insert the admin user if not found
            await pool.query(`
                INSERT INTO Users (
                    First_Name, Last_Name, Email, Password_Hash, Phone_Number, Country_Code,
                    Verification_Code, Verified, Code_Expires_At, Is_Admin, Is_Banned, 
                    License_Number, Balance
                ) VALUES (
                    'Admin', 'User', 'parkflow113@gmail', $1, '+1234567890', '+1',
                    'ADMIN123', TRUE, NULL, TRUE, FALSE, 
                    'ADMIN_LICENSE_123', 1000.00
                );
            `, [hashedPassword]);

            console.log("✅ Admin user inserted successfully with hashed password.");
        } else {
            console.log("✅ Admin user already exists.");
        }

        res.status(200).send('✅ Database tables are set up successfully!');
    } catch (error) {
        console.error('Database setup error:', error);
        res.status(500).send('Failed to create tables: ' + error.message);
    }
});

// Insert data into Users (optional route for inserting users)
app.post('/insert', async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone_number, country_code, verification_code, code_expires_at, is_admin, is_banned, license_number, balance } = req.body.user;

        await pool.query(`
            INSERT INTO Users (
                First_Name, Last_Name, Email, Password_Hash, Phone_Number, Country_Code, 
                Verification_Code, Verified, Code_Expires_At, Is_Admin, Is_Banned, 
                License_Number, Balance
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, FALSE, $8, $9, $10, $11, $12
            );
        `, [
            first_name, last_name, email, 
            password, phone_number, country_code, 
            verification_code, code_expires_at, is_admin, 
            is_banned, license_number, balance
        ]);

        console.log("✅ User inserted successfully.");
        res.status(201).send('✅ User inserted successfully.');
    } catch (error) {
        console.error('Error inserting user:', error);
        res.status(500).send('Failed to insert user: ' + error.message);
    }
});

// Clear all users (for testing purposes)
app.post('/clear', async (req, res) => {
    try {
        await pool.query('DELETE FROM Users');
        res.status(200).send('cleared');
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
});

// Catch-all 404 handler for any undefined routes
app.use((req, res) => {
    res.status(404).render('404');  // Ensure you have a 404.pug file
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
