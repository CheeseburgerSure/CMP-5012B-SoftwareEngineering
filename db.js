const { Pool } = require('pg')
const pool = new Pool({
    host: 'db',
    port: 5432,
    user: 'dbUser',
    password: '123',
    database: 'db1'
})

module.exports = pool