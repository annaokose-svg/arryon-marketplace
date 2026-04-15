import nodemailer from 'nodemailer';
import { readDb, writeDb } from '../../../../lib/db';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const db = await readDb();
  const existingSeller = db.sellers.find(s => s.email === email);
  if (existingSeller) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
  }

  const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // Store pending verification
  db.pendingVerifications = db.pendingVerifications || [];
  db.pendingVerifications.push({
    email,
    token: verificationToken,
    expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  await writeDb(db);

  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/seller/verify-email?token=${verificationToken}`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Verify your Arryona seller account',
      html: `
        <h1>Welcome to Arryona Marketplace!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    return NextResponse.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
  }
}