const express = require('express');
const router = express.Router();
const {
  submitContactForm
} = require('../controllers/contactController');

// Sirf ek public route - form submit karne ke liye
router.post('/', submitContactForm);

module.exports = router;