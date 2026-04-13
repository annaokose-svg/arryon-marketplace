import { NextResponse } from 'next/server';
import { readDb } from '../../../../lib/db';

export async function POST(request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const db = await readDb();
  const customer = db.customers.find((item) => item.email === email && item.password === password);
  if (!customer) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const { password: _discard, ...safeCustomer } = customer;
  return NextResponse.json(safeCustomer);
}
