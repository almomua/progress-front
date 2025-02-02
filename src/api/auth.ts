import type { VercelRequest, VercelResponse } from '@vercel/node';
import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const USERS_FILE = join(DATA_DIR, 'users.json');

// Ensure data directory and files exist
async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(USERS_FILE);
    } catch {
      const defaultUsers = [
        { username: 'shoge', password: '123', role: 'admin' },
        { username: 'mariam', password: '123', role: 'user' }
      ];
      await fs.writeFile(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
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
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'POST') {
      const { username, password } = req.body;
      const data = await fs.readFile(USERS_FILE, 'utf8');
      const users = JSON.parse(data);
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        return res.status(200).json(user);
      } else {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
