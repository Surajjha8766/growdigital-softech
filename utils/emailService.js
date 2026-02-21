const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendContactEmail(contactData) {
    const { name, email, phone, subject, message } = contactData;

    // Email to company (info@growdigitalsoftech.in)
    const companyMailOptions = {
      from: `"Grow Digital Softech Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || 'info@growdigitalsoftech.in',
      subject: `New Contact: ${subject || 'No Subject'} - ${name}`,
      html: this.getCompanyEmailHTML(contactData),
      text: this.getCompanyEmailText(contactData)
    };

    // Send email to company
    await this.transporter.sendMail(companyMailOptions);

    // Optional: Send auto-reply to user
    if (process.env.SEND_AUTO_REPLY === 'true') {
      const userMailOptions = {
        from: `"Grow Digital Softech" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Thank you for contacting Grow Digital Softech',
        html: this.getUserAutoReplyHTML(name)
      };
      
      // Don't await this to not block the main process
      this.transporter.sendMail(userMailOptions).catch(err => 
        console.error('Auto-reply failed:', err)
      );
    }
  }

  getCompanyEmailHTML(data) {
    const { name, email, phone, subject, message } = data;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7fc; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { font-size: 28px; margin-bottom: 10px; }
          .header p { opacity: 0.9; font-size: 16px; }
          .content { padding: 30px; }
          .field { margin-bottom: 25px; }
          .label { font-size: 14px; color: #666; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
          .value { background: #f8fafd; padding: 15px; border-radius: 10px; color: #333; font-size: 16px; border-left: 4px solid #2a5298; }
          .message-box { background: #f0f4fa; padding: 20px; border-radius: 10px; margin: 20px 0; font-style: italic; line-height: 1.6; }
          .footer { background: #f8fafd; padding: 20px; text-align: center; border-top: 1px solid #e1e8f0; }
          .badge { display: inline-block; background: #2a5298; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; margin-bottom: 15px; }
          .contact-info { background: #e8f0fe; padding: 15px; border-radius: 10px; margin-top: 20px; }
          .contact-info a { color: #2a5298; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📬 New Contact Form Submission</h1>
            <p>You've received a new message from your website</p>
          </div>
          
          <div class="content">
            <div style="text-align: right; margin-bottom: 20px;">
              <span class="badge">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
            </div>
            
            <div class="field">
              <div class="label">👤 Name</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <div class="label">📧 Email</div>
              <div class="value">
                <a href="mailto:${email}" style="color: #2a5298; text-decoration: none;">${email}</a>
              </div>
            </div>
            
            <div class="field">
              <div class="label">📞 Phone</div>
              <div class="value">
                <a href="tel:${phone}" style="color: #2a5298; text-decoration: none;">${phone}</a>
              </div>
            </div>
            
            ${subject ? `
            <div class="field">
              <div class="label">📝 Subject</div>
              <div class="value">${subject}</div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="label">💬 Message</div>
              <div class="message-box">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div class="contact-info">
              <h4 style="margin-bottom: 10px; color: #1e3c72;">Quick Actions:</h4>
              <p>📧 Reply to: <a href="mailto:${email}">${email}</a></p>
              <p>📞 Call: <a href="tel:${phone}">${phone}</a></p>
              <p>💬 WhatsApp: <a href="https://wa.me/${phone}">Send WhatsApp Message</a></p>
            </div>
          </div>
          
          <div class="footer">
            <p style="color: #666; font-size: 13px;">
              This email was sent from the contact form at Grow Digital Softech<br>
              Sanjay Colony, Sector 23, Faridabad, Haryana 121005
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getCompanyEmailText(data) {
    const { name, email, phone, subject, message } = data;
    return `
NEW CONTACT FORM SUBMISSION
================================
Time: ${new Date().toLocaleString('en-IN')}

Name: ${name}
Email: ${email}
Phone: ${phone}
Subject: ${subject || 'No Subject'}

Message:
${message}

---
Grow Digital Softech
Sanjay Colony, Sector 23, Faridabad
    `;
  }

  getUserAutoReplyHTML(name) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f7fc; }
          .container { max-width: 500px; margin: 20px auto; background: white; border-radius: 10px; padding: 30px; }
          .logo { text-align: center; margin-bottom: 20px; }
          .logo h2 { color: #1e3c72; }
          .message { color: #333; line-height: 1.6; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h2>Grow Digital Softech</h2>
          </div>
          <div class="message">
            <h3>Thank You for Contacting Us!</h3>
            <p>Dear ${name},</p>
            <p>We have received your message and our team will get back to you within 24 hours.</p>
            <p>For urgent inquiries, please call us at: <a href="tel:+918766297212">+91 87662 97212</a></p>
          </div>
          <div class="footer">
            <p>Grow Digital Softech | Sanjay Colony, Sector 23, Faridabad</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();