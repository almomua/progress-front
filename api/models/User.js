import mongoose from 'mongoose';

// Prevent multiple model compilations in serverless environment
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'user'],
      message: '{VALUE} is not a valid role'
    },
    default: 'user'
  }
}, {
  timestamps: true,
  // Add this to ensure virtuals are included when converting to JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Delete the model if it exists to prevent OverwriteModelError
if (mongoose.models.User) {
  delete mongoose.models.User;
}

// Create and export the model
const User = mongoose.model('User', userSchema);
export default User;
