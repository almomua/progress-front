import cors from 'cors';
import { connectToDatabase } from '../utils/mongodb.js';
import Todo from '../models/Todo.js';

// CORS middleware
const corsMiddleware = cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 200
});

export default async function handler(req, res) {
  console.log('Received todos request:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query
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

  try {
    // Connect to MongoDB
    await connectToDatabase();

    switch (req.method) {
      case 'GET':
        const todos = await Todo.find().sort({ createdAt: -1 });
        return res.status(200).json(todos);
      
      case 'POST':
        // Parse request body
        let body;
        try {
          body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        } catch (e) {
          return res.status(400).json({ 
            error: { 
              message: 'Invalid request body',
              details: e.message
            } 
          });
        }

        // Create new todo
        const newTodo = await Todo.create(body);
        return res.status(201).json(newTodo);

      case 'PUT':
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({
            error: {
              message: 'Todo ID is required'
            }
          });
        }

        const updatedTodo = await Todo.findByIdAndUpdate(
          id,
          { $set: req.body },
          { new: true, runValidators: true }
        );

        if (!updatedTodo) {
          return res.status(404).json({
            error: {
              message: 'Todo not found'
            }
          });
        }

        return res.status(200).json(updatedTodo);

      case 'DELETE':
        const todoId = req.query.id;
        if (!todoId) {
          return res.status(400).json({
            error: {
              message: 'Todo ID is required'
            }
          });
        }

        const deletedTodo = await Todo.findByIdAndDelete(todoId);
        if (!deletedTodo) {
          return res.status(404).json({
            error: {
              message: 'Todo not found'
            }
          });
        }

        return res.status(200).json({ message: 'Todo deleted successfully' });

      default:
        return res.status(405).json({ 
          error: { 
            message: 'Method not allowed',
            method: req.method
          } 
        });
    }
  } catch (error) {
    console.error('Todos error:', error);
    return res.status(500).json({ 
      error: { 
        message: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      } 
    });
  }
}
