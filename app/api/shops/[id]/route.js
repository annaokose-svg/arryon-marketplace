import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../../lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  const db = await readDb();
  const seller = db.sellers.find((item) => item.id === id);
  if (!seller) {
    return NextResponse.json({ error: 'Shop not found.' }, { status: 404 });
  }

  const { password, ...safeSeller } = seller;
  return NextResponse.json(safeSeller);
}

export async function PUT(request, { params }) {
  const { id } = params;
  const updates = await request.json();
  const db = await readDb();
  const seller = db.sellers.find((item) => item.id === id);
  if (!seller) {
    return NextResponse.json({ error: 'Shop not found.' }, { status: 404 });
  }

  const fields = ['businessName', 'description', 'contactEmail', 'location', 'category', 'featured'];
  fields.forEach((field) => {
    if (updates[field] !== undefined) {
      seller[field] = updates[field];
    }
  });

  if (updates.media !== undefined) {
    seller.media = {
      ...seller.media,
      ...updates.media
    };
  }

  if (updates.bankDetails !== undefined) {
    seller.bankDetails = {
      ...seller.bankDetails,
      ...updates.bankDetails
    };
  }

  await writeDb(db);
  const { password, ...safeSeller } = seller;
  return NextResponse.json(safeSeller);
}
