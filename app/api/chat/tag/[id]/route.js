import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { tags } = await request.json();

    if (!Array.isArray(tags)) {
      return NextResponse.json({ error: 'Tags must be an array' }, { status: 400 });
    }

    const db = await readDb();
    const conversation = db.chats.find((chat) => chat.id === id);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    conversation.tags = [...new Set(tags.filter((tag) => typeof tag === 'string' && tag.trim() !== ''))];
    conversation.updatedAt = new Date().toISOString();
    await writeDb(db);

    return NextResponse.json({ success: true, conversation });
  } catch (error) {
    console.error('Chat tag error:', error);
    return NextResponse.json({ error: 'Failed to update tags' }, { status: 500 });
  }
}
