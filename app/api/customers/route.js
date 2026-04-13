import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../lib/db';

export async function GET() {
  const db = await readDb();
  return NextResponse.json(db.customers);
}

export async function POST(request) {
  const body = await request.json();
  const { email, password, name, location } = body;

  if (!email || !password || !name || !location) {
    return NextResponse.json({ error: 'Missing customer registration fields.' }, { status: 400 });
  }

  const db = await readDb();
  const existingCustomer = db.customers.find((customer) => customer.email === email);
  if (existingCustomer) {
    return NextResponse.json({ error: 'A customer with that email already exists.' }, { status: 409 });
  }

  const id = crypto.randomUUID();
  const customer = {
    id,
    email,
    password,
    name,
    location,
    createdAt: new Date().toISOString()
  };

  db.customers.push(customer);
  await writeDb(db);

  const { password: _discard, ...safeCustomer } = customer;
  return NextResponse.json(safeCustomer);
}
