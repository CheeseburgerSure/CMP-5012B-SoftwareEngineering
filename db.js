const { Pool } = require('pg')
const pool = new Pool({
    host: 'parkflow-db',
    port: 5432,
    user: 'dbUser',
    password: '123',
    database: 'parkflow113-db'
})

module.exports = pool