import mongoose from 'mongoose';

let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) {
    console.log('=> Using existing database connection');
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
    
    console.log('=> Creating new database connection');
    await mongoose.connect(MONGODB_URI, opts);
    
    isConnected = true;
    console.log('=> Successfully connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};
