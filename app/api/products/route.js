import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId');
  const db = await readDb();

  if (sellerId) {
    return NextResponse.json(db.products.filter((product) => product.sellerId === sellerId));
  }

  return NextResponse.json(db.products);
}

export async function POST(request) {
  const body = await request.json();
  const {
    sellerId,
    name,
    description,
    price,
    category,
    imageUrl,
    videoUrl,
    imageUrls,
    videoUrls,
    stock,
    sizes,
    targetDemographic,
    colors
  } = body;

  if (!sellerId || !name || !description) {
    return NextResponse.json({ error: 'Missing product fields.' }, { status: 400 });
  }

  const normalizedImageUrls = Array.isArray(imageUrls)
    ? imageUrls
    : imageUrl
    ? [imageUrl]
    : [];
  const normalizedVideoUrls = Array.isArray(videoUrls)
    ? videoUrls
    : videoUrl
    ? [videoUrl]
    : [];

  const db = await readDb();
  const product = {
    id: crypto.randomUUID(),
    sellerId,
    name,
    description,
    price: Number(price || 0),
    category: category || 'General',
    imageUrls: normalizedImageUrls,
    videoUrls: normalizedVideoUrls,
    imageUrl: normalizedImageUrls[0] || null,
    videoUrl: normalizedVideoUrls[0] || null,
    stock: Number(stock || 0),
    status: 'live',
    views: 0,
    sizes: sizes || [],
    targetDemographic: targetDemographic || [],
    colors: colors || '',
    createdAt: new Date().toISOString()
  };

  // Simple suspicious detection
  const desc = description.toLowerCase();
  const prodName = name.toLowerCase();
  product.isSuspicious = price < 0.01 || desc.includes('scam') || desc.includes('fake') || desc.includes('illegal') || prodName.includes('counterfeit') || prodName.includes('fake');

  db.products.push(product);
  await writeDb(db);

  return NextResponse.json(product);
}
