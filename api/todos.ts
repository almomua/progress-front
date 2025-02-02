import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Todo } from '../src/types';

// In-memory store (will be replaced with a proper database in production)
let todos: Todo[] = [];

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const { method } = request;

  switch (method) {
    case 'GET':
      return response.status(200).json(todos);

    case 'POST':
      const newTodo = request.body;
      newTodo.id = Date.now();
      todos.push(newTodo);
      return response.status(201).json(newTodo);

    case 'PUT':
      const updatedTodo = request.body;
      todos = todos.map(todo => 
        todo.id === updatedTodo.id ? updatedTodo : todo
      );
      return response.status(200).json(updatedTodo);

    default:
      response.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return response.status(405).end(`Method ${method} Not Allowed`);
  }
}
