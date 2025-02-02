import type { VercelRequest, VercelResponse } from '@vercel/node';

// Store users in memory since Edge Runtime doesn't support file system
const users = [
  { username: 'shoge', password: '123', role: 'admin' },
  { username: 'mariam', password: '123', role: 'user' }
];

export const config = {
  runtime: 'edge'
};

export default async function handler(req: VercelRequest) {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers, status: 204 });
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { username, password } = body;
      
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        return new Response(JSON.stringify(user), {
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          status: 200
        });
      } else {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          status: 401
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    status: 405
  });
}
