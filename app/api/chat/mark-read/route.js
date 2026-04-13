import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function POST(request) {
  try {
    const { conversationId, messageIds } = await request.json();

    if (!conversationId || !Array.isArray(messageIds)) {
      return NextResponse.json(
        { error: 'Conversation ID and message IDs array are required' },
        { status: 400 }
      );
    }

    const db = await readDb();

    // Find the conversation
    const conversation = db.chats.find(c => c.id === conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Mark specified messages as read
    let updated = false;
    conversation.messages.forEach(msg => {
      if (messageIds.includes(msg.id) && !msg.read) {
        msg.read = true;
        msg.status = 'read';
        updated = true;
      }
    });

    if (updated) {
      conversation.updatedAt = new Date().toISOString();
      await writeDb(db);
    }

    return NextResponse.json({
      success: true,
      updated
    });

  } catch (error) {
    console.error('Chat mark read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
