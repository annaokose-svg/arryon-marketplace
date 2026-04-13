import { promises as fs } from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

async function ensureDbExists() {
  try {
    await fs.access(dbPath);
  } catch (error) {
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(
      dbPath,
      JSON.stringify({ sellers: [], products: [], customers: [], chats: [] }, null, 2),
      'utf8'
    );
  }
}

export async function readDb() {
  await ensureDbExists();
  const raw = await fs.readFile(dbPath, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    // Validate the structure
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.sellers) || !Array.isArray(parsed.products)) {
      throw new Error('Invalid database structure');
    }
    // Ensure chats array exists
    if (!Array.isArray(parsed.chats)) {
      parsed.chats = [];
    }
    return parsed;
  } catch (error) {
    console.error('Database file is corrupted, resetting...', error);
    const emptyDb = { sellers: [], products: [], customers: [], chats: [], orders: [] };
    await writeDb(emptyDb);
    return emptyDb;
  }
}

export async function writeDb(data) {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
}
