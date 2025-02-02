import type { VercelRequest, VercelResponse } from '@vercel/node';

// Store users in memory since Edge Runtime doesn't support file system
const users = [
  { username: 'shoge', password: '123', role: 'admin' },
  { username: 'mariam', password: '123', role: 'user' }
];

export const config = {
  runtime: 'edge'
};

export default async function handler(req: Request) {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers, status: 204 });
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      console.log('Received auth request:', body);
      
      const { username, password } = body;
      
      if (!username || !password) {
        return new Response(
          JSON.stringify({ error: 'Username and password are required' }), 
          { headers, status: 400 }
        );
      }

      const user = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === password
      );
      
      console.log('Found user:', user);
      
      if (user) {
        return new Response(
          JSON.stringify({ 
            username: user.username,
            role: user.role 
          }), 
          { headers, status: 200 }
        );
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }), 
          { headers, status: 401 }
        );
      }
    } catch (error) {
      console.error('Auth error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }), 
        { headers, status: 500 }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }), 
    { headers, status: 405 }
  );
}
