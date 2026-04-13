import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../../lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  const db = await readDb();
  const product = db.products.find((item) => item.id === id);
  if (!product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(request, { params }) {
  const { id } = params;
  const updates = await request.json();
  const db = await readDb();
  const product = db.products.find((item) => item.id === id);
  if (!product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  const fields = ['name', 'description', 'price', 'category', 'status', 'stock'];
  fields.forEach((field) => {
    if (updates[field] !== undefined) {
      product[field] = updates[field];
    }
  });

  if (updates.imageUrls !== undefined) {
    product.imageUrls = updates.imageUrls;
    product.imageUrl = Array.isArray(updates.imageUrls) ? updates.imageUrls[0] || null : updates.imageUrls;
  } else if (updates.imageUrl !== undefined) {
    product.imageUrl = updates.imageUrl;
    product.imageUrls = updates.imageUrl ? [updates.imageUrl] : [];
  }

  if (updates.videoUrls !== undefined) {
    product.videoUrls = updates.videoUrls;
    product.videoUrl = Array.isArray(updates.videoUrls) ? updates.videoUrls[0] || null : updates.videoUrls;
  } else if (updates.videoUrl !== undefined) {
    product.videoUrl = updates.videoUrl;
    product.videoUrls = updates.videoUrl ? [updates.videoUrl] : [];
  }

  await writeDb(db);
  return NextResponse.json(product);
}
