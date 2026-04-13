import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function POST(request) {
  try {
    const { conversationId, message, senderType } = await request.json();

    if (!message || !senderType) {
      return NextResponse.json(
        { error: 'Message and senderType are required' },
        { status: 400 }
      );
    }

    const db = await readDb();

    // Create or update conversation
    let conversation = db.chats.find(c => c.id === conversationId);
    
    if (!conversation) {
      // Create new conversation
      conversation = {
        id: `chat_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        status: 'open'
      };
      db.chats.push(conversation);
    }

    // Add message to conversation
    const newMessage = {
      id: `msg_${Date.now()}`,
      text: message,
      senderType, // 'customer' or 'support'
      timestamp: new Date().toISOString(),
      status: senderType === 'support' ? 'delivered' : 'sent',
      read: false
    };

    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date().toISOString();

    await writeDb(db);

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      message: newMessage
    });

  } catch (error) {
    console.error('Chat send error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
