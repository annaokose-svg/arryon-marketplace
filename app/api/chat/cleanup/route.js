import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function POST(request) {
  try {
    const db = await readDb();

    if (!db.chats) {
      db.chats = [];
    }

    // Close conversations that haven't been updated in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let closedCount = 0;

    db.chats.forEach(chat => {
      if (chat.status === 'open' && new Date(chat.updatedAt) < sevenDaysAgo) {
        chat.status = 'closed';
        closedCount++;
      }
    });

    if (closedCount > 0) {
      await writeDb(db);
    }

    return NextResponse.json({
      success: true,
      closedCount
    });

  } catch (error) {
    console.error('Chat cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup conversations' },
      { status: 500 }
    );
  }
}