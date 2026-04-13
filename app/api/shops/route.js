import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../lib/db';

export async function GET() {
  const db = await readDb();
  return NextResponse.json(db.sellers);
}

export async function POST(request) {
  const body = await request.json();
  const {
    email,
    password,
    businessName,
    description,
    contactEmail,
    location,
    category,
    media,
    nationality,
    idType,
    idName,
    featured
  } = body;

  if (!email || !password || !businessName || !nationality || !idType || !idName) {
    return NextResponse.json({ error: 'Missing seller registration fields.' }, { status: 400 });
  }

  const db = await readDb();
  const existingSeller = db.sellers.find((seller) => seller.email === email);
  if (existingSeller) {
    return NextResponse.json({ error: 'A seller with that email already exists.' }, { status: 409 });
  }

  const existingBusiness = db.sellers.find((seller) => seller.businessName === businessName);
  if (existingBusiness) {
    return NextResponse.json({ error: 'A seller with that business name already exists.' }, { status: 409 });
  }

  const id = crypto.randomUUID();
  const seller = {
    id,
    email,
    password,
    businessName,
    description,
    contactEmail,
    location,
    category,
    nationality,
    idType,
    idName,
    verification: {
      status: 'pending',
      requestedAt: new Date().toISOString(),
      faceVerified: false,
      documentVerified: false
    },
    media: media || {},
    bankDetails: body.bankDetails || {},
    featured: featured ?? true,
    createdAt: new Date().toISOString()
  };

  db.sellers.push(seller);
  await writeDb(db);

  const { password: _discard, ...safeSeller } = seller;
  return NextResponse.json(safeSeller);
}
