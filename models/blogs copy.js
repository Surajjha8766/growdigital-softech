const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  excerpt: String,
  category: String,
  image: String,
  tags: String,
  author: { type: String, default: 'Admin' },
  status: { type: String, default: 'draft' },
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  date: {
    type: String,
    default: () => new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);