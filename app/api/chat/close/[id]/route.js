import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const db = await readDb();
    const conversation = db.chats.find((chat) => chat.id === id);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    }

    conversation.status = 'closed';
    conversation.updatedAt = new Date().toISOString();
    await writeDb(db);

    return NextResponse.json({ success: true, conversation });
  } catch (error) {
    console.error('Chat close error:', error);
    return NextResponse.json(
      { error: 'Failed to close conversation.' },
      { status: 500 }
    );
  }
}
