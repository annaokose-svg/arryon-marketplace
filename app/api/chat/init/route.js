import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function POST(request) {
  try {
    const { userIdentifier, userType, userFullName } = await request.json();

    if (!userIdentifier || !userType) {
      return NextResponse.json(
        { error: 'User authentication is required to start a chat.' },
        { status: 401 }
      );
    }
    const db = await readDb();

    if (!db.chats) {
      db.chats = [];
    }

    const existingConversation = db.chats.find(
      (c) => c.userIdentifier === userIdentifier && c.status === 'open'
    );

    if (existingConversation) {
      if (userFullName) {
        existingConversation.userFullName = userFullName;
      }

      return NextResponse.json({
        success: true,
        conversationId: existingConversation.id,
        messages: existingConversation.messages
      });
    }

    const conversationId = `chat_${Date.now()}`;
    const newConversation = {
      id: conversationId,
      userIdentifier,
      userType,
      userFullName: userFullName || 'Unknown User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      status: 'open'
    };

    db.chats.push(newConversation);
    await writeDb(db);

    return NextResponse.json({
      success: true,
      conversationId,
      messages: []
    });
  } catch (error) {
    console.error('Chat init error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize conversation' },
      { status: 500 }
    );
  }
}