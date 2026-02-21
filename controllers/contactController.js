const Contact = require('../models/contact');
const nodemailer = require('nodemailer');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    // Email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number'
      });
    }

    // Message length validation
    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters long'
      });
    }

    // Save to database (optional - agar database mein save karna hai to)
    let savedContact = null;
    try {
      const contact = new Contact({
        name,
        email,
        phone,
        subject: subject || 'No Subject',
        message
      });
      savedContact = await contact.save();
      console.log('Contact saved to database:', savedContact._id);
    } catch (dbError) {
      console.error('Database save error:', dbError.message);
      // Database save fail ho bhi jaye to bhi email bhejna hai
    }

    // Send email to info@growdigitalsoftech.in
    try {
      // Create transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Email content
      const mailOptions = {
        from: `"Grow Digital Softech Website" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO || 'info@growdigitalsoftech.in',
        subject: subject ? `New Contact: ${subject}` : `New Message from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">New Contact Form Submission</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; font-weight: bold; width: 120px;">Name:</td>
                <td style="padding: 10px 0;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold;">Email:</td>
                <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold;">Phone:</td>
                <td style="padding: 10px 0;"><a href="tel:${phone}" style="color: #2563eb;">${phone}</a></td>
              </tr>
              ${subject ? `
              <tr>
                <td style="padding: 10px 0; font-weight: bold;">Subject:</td>
                <td style="padding: 10px 0;">${subject}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px 0; font-weight: bold; vertical-align: top;">Message:</td>
                <td style="padding: 10px 0; background: #f5f5f5; padding: 15px; border-radius: 5px;">${message.replace(/\n/g, '<br>')}</td>
              </tr>
            </table>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
              <p>Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            </div>
          </div>
        `
      };

      // Send email
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully to', process.env.EMAIL_TO);

    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      
      // Agar email fail ho jaye to bhi user ko error mat dikhao
      // Sirf log karo aur continue karo
    }

    // Success response
    res.status(200).json({
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon!'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
};