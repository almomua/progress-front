import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Delete the model if it exists to prevent OverwriteModelError in development
if (mongoose.models.Todo) {
  delete mongoose.models.Todo;
}

const Todo = mongoose.model('Todo', todoSchema);
export default Todo;
