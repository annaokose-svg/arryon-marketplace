import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../../lib/db';

export async function GET(request, { params }) {
  const db = await readDb();
  const customer = db.customers.find((item) => item.id === params.id);
  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  const { password, ...safeCustomer } = customer;
  return NextResponse.json(safeCustomer);
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { name, email, password: newPassword, currentPassword } = body;

    const db = await readDb();
    const customer = db.customers.find((item) => item.id === params.id);
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    if (email && email !== customer.email) {
      const duplicate = db.customers.find((item) => item.email === email && item.id !== params.id);
      if (duplicate) {
        return NextResponse.json({ error: 'This email is already in use.' }, { status: 409 });
      }
    }

    if (newPassword) {
      if (!currentPassword || currentPassword !== customer.password) {
        return NextResponse.json({ error: 'Current password is required to update your password.' }, { status: 401 });
      }
      customer.password = newPassword;
    }

    if (name) customer.name = name;
    if (email) customer.email = email;
    customer.updatedAt = new Date().toISOString();
    await writeDb(db);

    const { password, ...safeCustomer } = customer;
    return NextResponse.json(safeCustomer);
  } catch (error) {
    console.error('Customer update error:', error);
    return NextResponse.json({ error: 'Failed to update customer profile.' }, { status: 500 });
  }
}
