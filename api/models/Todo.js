import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  task: {
    type: String,
    required: [true, 'Task is required'],
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  rewards: {
    first: {
      type: String,
      required: [true, 'First reward is required']
    },
    second: {
      type: String,
      required: [true, 'Second reward is required']
    }
  },
  selectedReward: {
    type: String,
    required: false
  },
  expiryDate: {
    type: String,
    required: [true, 'Expiry date is required']
  },
  assignedTo: {
    type: String,
    required: [true, 'Assigned user is required'],
    trim: true
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
