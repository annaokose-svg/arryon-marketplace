import { NextResponse } from 'next/server';
import { readDb } from '../../../../lib/db';

export async function POST(request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const db = await readDb();
  const seller = db.sellers.find((item) => item.email === email && item.password === password);
  if (!seller) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const { password: _discard, ...safeSeller } = seller;
  return NextResponse.json(safeSeller);
}
