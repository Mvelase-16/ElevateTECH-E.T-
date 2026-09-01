const mysql = require('mysql2');

// Connect to MySQL server (without specifying a database yet)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to Local MySQL Server! 🟢');

  // Automatically create database if it doesn't exist
  db.query('CREATE DATABASE IF NOT EXISTS unibites_db', (err) => {
    if (err) throw err;

    // Switch to the database
    db.query('USE unibites_db', (err) => {
      if (err) throw err;

      // Automatically create the users table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL
        )
      `;
      db.query(createTableQuery, (err) => {
        if (err) throw err;
        console.log('Database and "users" table are fully ready! 🚀');
      });
    });
  });
});

module.exports = db;