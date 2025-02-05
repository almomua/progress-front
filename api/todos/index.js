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

  try {
    // Connect to MongoDB
    await connectToDatabase();
    console.log('MongoDB connection successful');

    switch (req.method) {
      case 'GET':
        const todos = await Todo.find({});
        console.log('Retrieved todos:', todos);
        return res.status(200).json(todos);
      
      case 'POST':
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

        console.log('Creating new todo:', body);
        const newTodo = new Todo(body);
        const savedTodo = await newTodo.save();
        console.log('Created todo:', savedTodo);
        return res.status(201).json(savedTodo);

      case 'PUT':
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({
            error: {
              message: 'Todo ID is required'
            }
          });
        }

        let updateBody;
        try {
          updateBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        } catch (e) {
          console.error('Error parsing update body:', e);
          return res.status(400).json({
            error: {
              message: 'Invalid request body',
              details: e.message
            }
          });
        }

        console.log('Updating todo:', { id, updates: updateBody });
        const updatedTodo = await Todo.findByIdAndUpdate(id, updateBody, { new: true });
        if (!updatedTodo) {
          return res.status(404).json({
            error: {
              message: 'Todo not found'
            }
          });
        }
        console.log('Updated todo:', updatedTodo);
        return res.status(200).json(updatedTodo);

      case 'DELETE':
        const { id: deleteId } = req.query;
        if (!deleteId) {
          return res.status(400).json({
            error: {
              message: 'Todo ID is required'
            }
          });
        }

        console.log('Deleting todo:', deleteId);
        const deletedTodo = await Todo.findByIdAndDelete(deleteId);
        if (!deletedTodo) {
          return res.status(404).json({
            error: {
              message: 'Todo not found'
            }
          });
        }
        console.log('Deleted todo:', deletedTodo);
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
    console.error('Error handling todo request:', error);
    return res.status(500).json({ 
      error: { 
        message: 'Internal server error',
        details: error.message
      } 
    });
  }
}
