const mysql = require('mysql2/promise');
require('dotenv').config();

module.exports = mysql.createConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
}).then(console.log('Successfully connected to database!'))