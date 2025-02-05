import mongoose from 'mongoose';
import User from '../../backend/models/User.js';
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
    // Connect to database
    await connectDB();

    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: { message: 'Username and password are required' } });
    }
    
    const user = await User.findOne({ username, password });
    
    if (user) {
      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user.toObject();
      return res.status(200).json(userWithoutPassword);
    } else {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: { message: error.message || 'Internal server error' } });
  }
}
