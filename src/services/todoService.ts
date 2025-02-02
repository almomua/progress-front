import { Todo } from '../types';

const TODOS_KEY = 'todos';
const USERS_KEY = 'users';

export interface User {
  username: string;
  password: string;
  role: 'admin' | 'user';
}

// Initialize default users if they don't exist
const initializeUsers = () => {
  const existingUsers = localStorage.getItem(USERS_KEY);
  if (!existingUsers) {
    const defaultUsers: User[] = [
      { username: 'shoge', password: '123', role: 'admin' },
      { username: 'mariam', password: '123', role: 'user' }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
};

// Initialize the service
export const initializeTodoService = () => {
  initializeUsers();
};

// Use relative paths for API endpoints when deploying to Vercel
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// User operations
export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  try {
    console.log('Attempting authentication with:', { username, password });
    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    console.log('Auth response status:', response.status);
    const data = await response.json();
    console.log('Auth response data:', data);
    
    if (!response.ok) {
      console.error('Auth failed:', data.error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

// Todo operations
export const getTodos = async (): Promise<Todo[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos`);
    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
};

export const saveTodos = async (todos: Todo[]): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todos),
    });
  } catch (error) {
    console.error('Error saving todos:', error);
  }
};

export const addTodo = async (todo: Omit<Todo, 'id'>): Promise<Todo> => {
  const todos = await getTodos();
  const newTodo = { ...todo, id: Date.now() };
  todos.push(newTodo);
  await saveTodos(todos);
  return newTodo;
};

export const updateTodo = async (updatedTodo: Todo): Promise<void> => {
  const todos = await getTodos();
  const index = todos.findIndex(t => t.id === updatedTodo.id);
  if (index !== -1) {
    todos[index] = updatedTodo;
    await saveTodos(todos);
  }
};

export const removeTodo = async (todoId: number): Promise<void> => {
  const todos = await getTodos();
  const filteredTodos = todos.filter(todo => todo.id !== todoId);
  await saveTodos(filteredTodos);
};
