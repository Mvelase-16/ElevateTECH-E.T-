const express = require('express');
const cors = require('cors');
const db = require('./db'); // Links to your database file

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Route that receives frontend data and saves it to local MySQL
app.post('/api/test', (req, res) => {
  const receivedName = req.body.name;
  
  const sqlQuery = "INSERT INTO users (name) VALUES (?)";

  db.query(sqlQuery, [receivedName], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: "Failed to save to database." });
    }

    console.log(`\n--- SUCCESS! ---`);
    console.log(`Saved "${receivedName}" into local MySQL database!`);
    console.log(`----------------\n`);
    
    res.json({ message: `Successfully saved ${receivedName} to local MySQL database!` });
  });
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});