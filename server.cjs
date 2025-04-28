const express = require('express');
const pool = require('./db.js');
const port = 3001;

const app = express();

app.use(express.json());

app.get('/', async (req, res) => {
    try {
        const data = await pool.query(
            'SELECT * FROM tests')

        res.status(200).send(data.rows);
    } catch (error) {
        console.log(error);
        res.status(500)
    }
});

app.post('/', async (req, res) => {
    try {
        await pool.query(
            'INSERT INTO tests (name) VALUES ($1)',
            [name]);

        res.status(200).send('inserted');
    } catch (error) {
        console.log(error);
        res.status(500)
    }
});

app.get('/setup', async (req, res) => {
    try {
        await pool.query(
            'CREATE TABLE IF NOT EXISTS tests (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL)'
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