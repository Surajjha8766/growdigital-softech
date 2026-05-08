// contactController.js - Updated with status and filter functionality
const Contact = require('../models/contact');
const { Resend } = require('resend');

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// ================= SUBMIT CONTACT =================
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    // Save in DB
    const newContact = await Contact.create({
      name,
      email,
      phone,
      subject: subject || 'No Subject',
      message,
      status: 'pending'
    });

    console.log('Form submitted:', { name, email, phone, subject });

    // 1. Send email to ADMIN
    await resend.emails.send({
      from: 'Grow Digital Softech <team@growdigitalsoftech.in>',
      to: ['info.growdigitalsoftech@gmail.com'],
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1E5BFF; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f5f7fd; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #1E5BFF; margin-bottom: 5px; }
            .value { background: white; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📬 New Contact Form Submission</h2>
              <p>Grow Digital Softech</p>
            </div>
            <div class="content">
              <div class="field"><div class="label">👤 Name</div><div class="value">${name}</div></div>
              <div class="field"><div class="label">📧 Email</div><div class="value">${email}</div></div>
              <div class="field"><div class="label">📞 Phone</div><div class="value">${phone}</div></div>
              <div class="field"><div class="label">📋 Subject</div><div class="value">${subject || 'No Subject'}</div></div>
              <div class="field"><div class="label">💬 Message</div><div class="value">${message.replace(/\n/g, '<br/>')}</div></div>
            </div>
          </div>
        </body>
        </html>
      `
    });

    // 2. Send THANK YOU email to USER
    await resend.emails.send({
      from: 'Grow Digital Softech Team <team@growdigitalsoftech.in>',
      to: [email],
      subject: 'Thank you for contacting Grow Digital Softech!',
      html: `
        <!DOCTYPE html>
        <html>
        <head><style>body{font-family:Arial,sans-serif;}</style></head>
        <body>
          <h2>Thank You ${name}! 🙏</h2>
          <p>We have received your message and will get back to you within 24 hours.</p>
          <p>📞 Need immediate help? Call us: +91 87662 97212</p>
          <p>💬 WhatsApp: <a href="https://wa.me/918766297212">Click to chat</a></p>
          <hr/>
          <p>Grow Digital Softech<br/>Building Digital Excellence</p>
        </body>
        </html>
      `
    });

    res.status(200).json({ success: true, message: 'Message sent successfully! We will contact you soon.' });

  } catch (err) {
    console.error('Resend Error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ================= GET ALL MESSAGES WITH FILTERS =================
exports.getAllMessages = async (req, res) => {
  try {
    const { filter, startDate, endDate, status } = req.query;
    let query = {};

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Date filters
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (filter === 'today') {
      query.createdAt = { $gte: today };
    } 
    else if (filter === 'yesterday') {
      query.createdAt = { $gte: yesterday, $lt: today };
    }
    else if (filter === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }

    const messages = await Contact.find(query).sort({ createdAt: -1 });
    
    // Get counts for stats
    const totalCount = await Contact.countDocuments();
    const unreadCount = await Contact.countDocuments({ read: false });
    const pendingCount = await Contact.countDocuments({ status: 'pending' });
    const contactedCount = await Contact.countDocuments({ status: 'contacted' });
    const completedCount = await Contact.countDocuments({ status: 'completed' });

    res.json({ 
      success: true, 
      messages,
      stats: {
        total: totalCount,
        unread: unreadCount,
        pending: pendingCount,
        contacted: contactedCount,
        completed: completedCount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================= GET SINGLE MESSAGE =================
exports.getMessageById = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    if (!message.read) {
      message.read = true;
      await message.save();
    }
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================= UPDATE MESSAGE STATUS =================
exports.updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'contacted', 'completed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================= DELETE MESSAGE =================
exports.deleteMessage = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};