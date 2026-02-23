// const Contact = require('../models/contact');
// const nodemailer = require('nodemailer');

// // @desc    Submit contact form
// // @route   POST /api/contact
// // @access  Public
// exports.submitContactForm = async (req, res) => {
//   try {
//     const { name, email, phone, subject, message } = req.body;

//     // Validation
//     if (!name || !email || !phone || !message) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please fill all required fields'
//       });
//     }

//     // Email validation
//     const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide a valid email address'
//       });
//     }

//     // Phone validation (10 digits)
//     const phoneRegex = /^[0-9]{10}$/;
//     if (!phoneRegex.test(phone)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide a valid 10-digit phone number'
//       });
//     }

//     // Message length validation
//     if (message.length < 10) {
//       return res.status(400).json({
//         success: false,
//         message: 'Message must be at least 10 characters long'
//       });
//     }

//     // Save to database
//     let savedContact = null;
//     try {
//       const contact = new Contact({
//         name,
//         email,
//         phone,
//         subject: subject || 'No Subject',
//         message,
//         read: false // Add read field to model
//       });
//       savedContact = await contact.save();
//       console.log('Contact saved to database:', savedContact._id);
//     } catch (dbError) {
//       console.error('Database save error:', dbError.message);
//     }

//     // Send email to info@growdigitalsoftech.in
//     try {
//       const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_PASS
//         }
//       });

//       const mailOptions = {
//         from: `"Grow Digital Softech Website" <${process.env.EMAIL_USER}>`,
//         to: process.env.EMAIL_TO || 'info@growdigitalsoftech.in',
//         subject: subject ? `New Contact: ${subject}` : `New Message from ${name}`,
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
//             <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">New Contact Form Submission</h2>
            
//             <table style="width: 100%; border-collapse: collapse;">
//               <tr>
//                 <td style="padding: 10px 0; font-weight: bold; width: 120px;">Name:</td>
//                 <td style="padding: 10px 0;">${name}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 10px 0; font-weight: bold;">Email:</td>
//                 <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
//               </tr>
//               <tr>
//                 <td style="padding: 10px 0; font-weight: bold;">Phone:</td>
//                 <td style="padding: 10px 0;"><a href="tel:${phone}" style="color: #2563eb;">${phone}</a></td>
//               </tr>
//               ${subject ? `
//               <tr>
//                 <td style="padding: 10px 0; font-weight: bold;">Subject:</td>
//                 <td style="padding: 10px 0;">${subject}</td>
//               </tr>
//               ` : ''}
//               <tr>
//                 <td style="padding: 10px 0; font-weight: bold; vertical-align: top;">Message:</td>
//                 <td style="padding: 10px 0; background: #f5f5f5; padding: 15px; border-radius: 5px;">${message.replace(/\n/g, '<br>')}</td>
//               </tr>
//             </table>
            
//             <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
//               <p>Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
//             </div>
//           </div>
//         `
//       };

//       await transporter.sendMail(mailOptions);
//       console.log('Email sent successfully to', process.env.EMAIL_TO);

//     } catch (emailError) {
//       console.error('Email sending failed:', emailError.message);
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Thank you for contacting us. We will get back to you soon!'
//     });

//   } catch (error) {
//     console.error('Contact form error:', error);
    
//     res.status(500).json({
//       success: false,
//       message: 'Something went wrong. Please try again later.'
//     });
//   }
// };

// // @desc    Get all messages (Admin)
// // @route   GET /api/contact/messages
// // @access  Private
// exports.getAllMessages = async (req, res) => {
//   try {
//     const messages = await Contact.find().sort({ createdAt: -1 });
    
//     res.json({
//       success: true,
//       messages,
//       total: messages.length,
//       unread: messages.filter(m => !m.read).length
//     });
//   } catch (error) {
//     console.error('Get messages error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch messages'
//     });
//   }
// };

// // @desc    Get single message by ID (Admin)
// // @route   GET /api/contact/messages/:id
// // @access  Private
// exports.getMessageById = async (req, res) => {
//   try {
//     const message = await Contact.findById(req.params.id);
    
//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         message: 'Message not found'
//       });
//     }

//     res.json({
//       success: true,
//       message
//     });
//   } catch (error) {
//     console.error('Get message error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch message'
//     });
//   }
// };

// // @desc    Mark message as read (Admin)
// // @route   PATCH /api/contact/messages/:id/read
// // @access  Private
// exports.markAsRead = async (req, res) => {
//   try {
//     const message = await Contact.findByIdAndUpdate(
//       req.params.id,
//       { read: true },
//       { new: true }
//     );

//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         message: 'Message not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Message marked as read',
//       data: message
//     });
//   } catch (error) {
//     console.error('Mark as read error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update message'
//     });
//   }
// };

// // @desc    Delete message (Admin)
// // @route   DELETE /api/contact/messages/:id
// // @access  Private
// exports.deleteMessage = async (req, res) => {
//   try {
//     const message = await Contact.findByIdAndDelete(req.params.id);

//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         message: 'Message not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Message deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete message error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete message'
//     });
//   }
// };


const Contact = require('../models/contact');
const nodemailer = require('nodemailer');

// ================= SUBMIT CONTACT =================
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject: subject || 'No Subject',
      message,
      read: false
    });

    // ===== MAIL SEND =====
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Grow Digital Softech" <${process.env.EMAIL_USER}>`,
      to: 'jhasuraj26748@gmail.com', // ✅ ONLY THIS
      subject: `New Contact Message`,
      html: `
        <h3>New Contact</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Message:</b><br/>${message}</p>
      `
    });

    res.json({ success: true, message: 'Message sent successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================= GET ALL MESSAGES =================
exports.getAllMessages = async (req, res) => {
  const messages = await Contact.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    total: messages.length,
    unread: messages.filter(m => !m.read).length,
    messages
  });
};

// ================= GET MESSAGE BY ID =================
exports.getMessageById = async (req, res) => {
  const message = await Contact.findById(req.params.id);

  if (!message) {
    return res.status(404).json({ success: false, message: 'Message not found' });
  }

  // auto mark as read
  if (!message.read) {
    message.read = true;
    await message.save();
  }

  res.json({ success: true, message });
};