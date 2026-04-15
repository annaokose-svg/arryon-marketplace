import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../../lib/db';

export async function POST(request) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const db = await readDb();
  const verification = db.pendingVerifications?.find(v => v.token === token);

  if (!verification || verification.expires < Date.now()) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }

  // Remove from pending
  db.pendingVerifications = db.pendingVerifications.filter(v => v.token !== token);

  // Mark email as verified (you can store this in a verified emails list or just proceed)
  db.verifiedEmails = db.verifiedEmails || [];
  db.verifiedEmails.push(verification.email);

  await writeDb(db);

  return NextResponse.json({ message: 'Email verified successfully' });
}