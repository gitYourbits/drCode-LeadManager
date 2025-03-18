const express = require('express');
const router = express.Router();
const { getAPI } = require('../controllers/aiFetch'); // Correct import

router.post('/api', getAPI);

router.get('/about', (req, res) => {
  res.send('About page');
});

router.get('/contact', (req, res) => {
  res.send('Contact page');
});

module.exports = router;
