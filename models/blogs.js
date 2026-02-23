const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  tags: { type: String, default: '' },
  author: { type: String, default: 'Admin' },
  status: { type: String, default: 'draft', enum: ['published', 'draft'] },
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },

  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  metaTitle: String,
  metaDescription: String,
  focusKeywords: String,
  canonicalUrl: String,
  ogImage: String,
  ogTitle: String,
  ogDescription: String,
  twitterCard: { type: String, default: 'summary_large_image' },
  noIndex: Boolean,
  noFollow: Boolean

}, { timestamps: true });

/* 🔹 Slug generator */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/* ✅ SAVE middleware (NO next) */
blogSchema.pre('save', function () {
  if (this.isModified('title') || !this.slug) {
    this.slug = generateSlug(this.title);
  }
});

/* ✅ UPDATE middleware (NO next) */
blogSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  if (update?.title) {
    update.slug = generateSlug(update.title);
  }
});

module.exports = mongoose.model('Blog', blogSchema);