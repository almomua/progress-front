import cors from 'cors';
import { connectToDatabase } from '../utils/mongodb.js';
import User from '../models/User.js';

// CORS middleware
const corsMiddleware = cors({
  origin: '*',
  methods: ['POST'],
  credentials: true,
  optionsSuccessStatus: 200
});

// Initialize default users if none exist
const initializeDefaultUsers = async () => {
  try {
    const count = await User.countDocuments();
    console.log('Current user count:', count);
    
    if (count === 0) {
      console.log('No users found, creating default users...');
      const defaultUsers = [
        {
          username: 'admin',
          password: 'admin123',
          role: 'admin'
        },
        {
          username: 'shoge',
          password: 'shoge123',
          role: 'user'
        }
      ];

      for (const user of defaultUsers) {
        await User.create(user);
        console.log('Created user:', user.username);
      }
      console.log('Default users created successfully');
    } else {
      console.log('Users already exist, skipping initialization');
    }
  } catch (error) {
    console.error('Error creating default users:', error);
    throw error;
  }
};

export default async function handler(req, res) {
  console.log('Received request:', {
    method: req.method,
    headers: req.headers,
    body: req.body
  });

  // Handle CORS
  await new Promise((resolve, reject) => {
    corsMiddleware(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: { 
        message: 'Method not allowed',
        method: req.method
      } 
    });
  }

  try {
    // Connect to MongoDB
    await connectToDatabase();
    console.log('MongoDB connection successful');

    // Initialize default users
    await initializeDefaultUsers();
    console.log('User initialization complete');

    // Parse request body
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
      console.error('Error parsing request body:', e);
      return res.status(400).json({ 
        error: { 
          message: 'Invalid request body',
          details: e.message
        } 
      });
    }

    const { username, password } = body;
    console.log('Login attempt for user:', username);
    
    if (!username || !password) {
      return res.status(400).json({ 
        error: { 
          message: 'Username and password are required',
          received: { username: !!username, password: !!password }
        } 
      });
    }
    
    const user = await User.findOne({ username, password });
    console.log('User lookup result:', user ? 'found' : 'not found');
    
    if (user) {
      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user.toObject();
      console.log('Login successful for user:', username);
      return res.status(200).json(userWithoutPassword);
    } else {
      console.log('Invalid credentials for user:', username);
      return res.status(401).json({ 
        error: { 
          message: 'Invalid credentials',
          username
        } 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: { 
        message: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      } 
    });
  }
}
