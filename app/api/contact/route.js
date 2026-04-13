import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name, email, query } = await request.json();

    // Validate required fields
    if (!name || !email || !query) {
      return NextResponse.json(
        { error: 'Name, email, and query are required.' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Try to send email using nodemailer
    try {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'deichmannltd@gmail.com',
          pass: 'lqil mjrz dftr ppkp'
        }
      });

    // Email options
    const mailOptions = {
      from: 'deichmannltd@gmail.com',
      to: 'deichmannltd@gmail.com',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong style="color: #374151;">Name:</strong> ${name}</p>
            <p><strong style="color: #374151;">Email:</strong> ${email}</p>
            <p><strong style="color: #374151;">Query:</strong></p>
            <p style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">${query}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This message was sent from the Arryona marketplace contact form.</p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log('Contact form email sent successfully to deichmannltd@gmail.com:', {
      name,
      email,
      query,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully. We will respond within 24 hours.'
    });

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // Fallback: Log the submission locally
      console.log('Contact form submission logged:', {
        name,
        email,
        query,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        message: 'Message received! We will respond within 24 hours.'
      });
    }

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}