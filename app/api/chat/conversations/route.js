import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const query = searchParams.get('q')?.toLowerCase();

    const db = await readDb();
    let conversations = (db.chats || []).slice();

    if (statusFilter) {
      conversations = conversations.filter(chat => chat.status === statusFilter);
    }

    if (query) {
      conversations = conversations.filter((chat) => {
        const idMatch = chat.id.toLowerCase().includes(query);
        const messageMatch = chat.messages?.some((message) =>
          message.text.toLowerCase().includes(query)
        );
        return idMatch || messageMatch;
      });
    }

    conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return NextResponse.json({
      success: true,
      conversations
    });

  } catch (error) {
    console.error('Chat get error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
