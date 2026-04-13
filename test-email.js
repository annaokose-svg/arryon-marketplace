const nodemailer = require('nodemailer');

// Create transporter for Gmail SMTP
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'deichmannltd@gmail.com',
    pass: 'lqil mjrz dftr ppkp' // Gmail app password
  }
});

// Test email options
const mailOptions = {
  from: 'deichmannltd@gmail.com',
  to: 'deichmannltd@gmail.com',
  subject: 'Test Email from Arryona Contact Form',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Test Email</h2>
      <p>This is a test email to verify that the contact form email functionality is working correctly.</p>
      <p><strong>Test Details:</strong></p>
      <ul>
        <li>Name: Test User</li>
        <li>Email: test@example.com</li>
        <li>Query: This is a test message</li>
      </ul>
    </div>
  `
};

// Send test email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending test email:', error);
  } else {
    console.log('Test email sent successfully:', info.response);
  }
});