import type { VercelRequest, VercelResponse } from '@vercel/node';
import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const TODOS_FILE = join(DATA_DIR, 'todos.json');

// Ensure data directory and files exist
async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(TODOS_FILE);
    } catch {
      await fs.writeFile(TODOS_FILE, '[]');
    }
  } catch (error) {
    console.error('Error ensuring data file:', error);
  }
}

// Initialize on cold start
ensureDataFile();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Ensure CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'GET') {
      const data = await fs.readFile(TODOS_FILE, 'utf8');
      return res.status(200).json(JSON.parse(data));
    }

    if (req.method === 'POST') {
      await fs.writeFile(TODOS_FILE, JSON.stringify(req.body, null, 2));
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
