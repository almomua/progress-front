import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage for todos
let todos: any[] = [];

export const config = {
  runtime: 'edge'
};

export default async function handler(req: VercelRequest) {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers, status: 204 });
  }

  if (req.method === 'GET') {
    return new Response(JSON.stringify(todos), {
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      todos = body; // Update todos with the new array
      
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        status: 200
      });
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
