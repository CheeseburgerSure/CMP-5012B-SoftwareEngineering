const express = require('express');
const pool = require('./db.js');
const port = 3000;

const app = express();

app.use(express.json());

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

app.post('/insert', async (req, res) => {
    try {
        // Insert into Users table
        if (req.body.user) {
            const { username, email, password, phonenumber, isadmin, isbanned, licensenumber, balance } = req.body.user;
            await pool.query(
                `INSERT INTO Users (
                    Username, Email, Password, PhoneNumber, 
                    IsAdmin, IsBanned, LicenseNumber, Balance
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [username, email, password, phonenumber, 
                 isadmin || false, isbanned || false, licensenumber, balance || 0.00]
            );
        }

        // Insert into Bookings table
        if (req.body.booking) {
            const { location, spacenumber, isblocked, date, time, isverified } = req.body.booking;
            await pool.query(
                `INSERT INTO Bookings (
                    Location, SpaceNumber, isBlocked, 
                    Date, Time, isVerified
                ) VALUES ($1, $2, $3, $4, $5, $6)`,
                [location, spacenumber, isblocked || false, 
                 date, time, isverified || false]
            );
        }

        // Insert into ParkingLots table
        if (req.body.parkingLot) {
            const { capacity } = req.body.parkingLot;
            await pool.query(
                'INSERT INTO ParkingLots (Capacity) VALUES ($1)',
                [capacity]
            );
        }

        res.status(200).json({ success: true, message: 'Data inserted successfully' });
    } catch (error) {
        console.error('Insert error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to insert data',
            error: error.message 
        });
    }
});

app.get('/setup', async (req, res) => {
    try {
        // Create Users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Users(
                UserID SERIAL PRIMARY KEY,
                Username VARCHAR(50) NOT NULL,
                Email VARCHAR(100) NOT NULL,
                Password VARCHAR(255) NOT NULL,
                PhoneNumber VARCHAR(20),
                IsAdmin BOOLEAN NOT NULL DEFAULT FALSE,
                IsBanned BOOLEAN NOT NULL DEFAULT FALSE,
                LicenseNumber VARCHAR(30),
                Balance DECIMAL(10, 2) DEFAULT 0.00
            )
        `);

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

        res.status(200).send('Tables created successfully');
    } catch (error) {
        console.error('Database setup error:', error);
        res.status(500).send('Failed to create tables: ' + error.message);
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



app.listen(port, () => {
    console.log(`Running on PORT ${port}`);
});