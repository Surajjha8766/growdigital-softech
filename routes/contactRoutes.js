const express = require('express');
const router = express.Router();

const {
  submitContactForm,
  getAllMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage
} = require('../controllers/contactController');

const { protect } = require('../middleware/authMiddleware');

// Public
router.post('/', submitContactForm);

// Admin routes
router.get('/messages', protect, getAllMessages);
router.get('/messages/:id', protect, getMessageById);
router.put('/messages/:id/status', protect, updateMessageStatus);
router.delete('/messages/:id', protect, deleteMessage);

module.exports = router;