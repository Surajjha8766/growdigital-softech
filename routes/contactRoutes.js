const express = require('express');
const router = express.Router();

const {
  submitContactForm,
  getAllMessages,
  getMessageById
} = require('../controllers/contactController');

const { protect } = require('../middleware/authMiddleware');

// Public
router.post('/', submitContactForm);

// Admin
router.get('/messages', getAllMessages);
router.get('/messages/:id', getMessageById);

module.exports = router;