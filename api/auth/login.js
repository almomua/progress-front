import mongoose from 'mongoose';
import User from '../models/User.js';
import cors from 'cors';

// Helper to connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Could not connect to MongoDB Atlas:', error);
    throw error;
  }
};

// Initialize default users if none exist
const initializeDefaultUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      await User.create([
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
      ]);
      console.log('Default users created');
    }
  } catch (error) {
    console.error('Error creating default users:', error);
  }
};

// CORS middleware
const corsMiddleware = cors({
  origin: '*',
  credentials: true,
});

export default async function handler(req, res) {
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
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    console.log('Initializing default users...');
    await initializeDefaultUsers();

    const { username, password } = req.body;
    console.log('Login attempt for user:', username);
    
    if (!username || !password) {
      return res.status(400).json({ error: { message: 'Username and password are required' } });
    }
    
    const user = await User.findOne({ username, password });
    console.log('User found:', user ? 'yes' : 'no');
    
    if (user) {
      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user.toObject();
      return res.status(200).json(userWithoutPassword);
    } else {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: { 
        message: 'Internal server error',
        details: error.message 
      } 
    });
  }
}
