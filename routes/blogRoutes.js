const express = require('express');
const {
  getBlogs,
  getBlog,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController.js');

const router = express.Router();

// Public routes (frontend ke liye)
router.get('/public', getBlogs);
router.get('/public/slug/:slug', getBlogBySlug);
router.get('/public/:id', getBlog);

// Admin routes
router.get('/', getBlogs);
router.get('/:id', getBlog);
router.post('/', createBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);

module.exports = router;