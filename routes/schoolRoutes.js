const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Add School API
router.post('/addSchool', async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    await db.execute(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, parseFloat(latitude), parseFloat(longitude)]
    );
    res.status(201).json({ message: 'School added successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// List Schools API
router.get('/listSchools', async (req, res) => {
  const { latitude, longitude } = req.query;
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  try {
    const [schools] = await db.execute('SELECT * FROM schools');
    const userLat = parseFloat(latitude);
    const userLong = parseFloat(longitude);

    const sortedSchools = schools.map((school) => {
      const distance = Math.sqrt(
        Math.pow(userLat - school.latitude, 2) + Math.pow(userLong - school.longitude, 2)
      );
      return { ...school, distance };
    }).sort((a, b) => a.distance - b.distance);

    res.status(200).json(sortedSchools);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
