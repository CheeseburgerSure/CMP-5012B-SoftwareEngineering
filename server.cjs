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

app.post('/', async (req, res) => {
    const { username, email, password, phonenumber, isadmin, isbanned, licensenumber, balance } = req.body;
    try {
        await pool.query(
            'INSERT INTO Users (Username, Email, Password, PhoneNumber, IsAdmin, IsBanned, LicenseNumber, Balance) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [username, email, password, phonenumber, isadmin, isbanned, licensenumber, balance]
          );

        res.status(200).send('inserted');
    } catch (error) {
        console.log(error);
        res.status(500)
    }
});

app.get('/setup', async (req, res) => {
    try {
        await pool.query(
            'CREATE TABLE IF NOT EXISTS Users (UserID SERIAL PRIMARY KEY,Username VARCHAR(50) NOT NULL,Email VARCHAR(100) NOT NULL,Password VARCHAR(255) NOT NULL,PhoneNumber VARCHAR(20),IsAdmin BOOLEAN NOT NULL DEFAULT FALSE,IsBanned BOOLEAN NOT NULL DEFAULT FALSE,LicenseNumber VARCHAR(30),Balance DECIMAL(10, 2) DEFAULT 0.00)'
        )
        res.status(200).send('created');
    } catch (error) {
        console.log(error);
        res.status(500)
    }
    });


app.listen(port, () => {
    console.log(`Running on PORT ${port}`);
});