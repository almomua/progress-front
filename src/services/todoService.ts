import { Todo } from '../types';

const USERS_KEY = 'users';

export interface User {
  username: string;
  role: 'admin' | 'user';
}

// Initialize default users if they don't exist
const initializeUsers = () => {
  const existingUsers = localStorage.getItem(USERS_KEY);
  if (!existingUsers) {
    const defaultUsers: User[] = [
      { username: 'shoge', role: 'admin' },
      { username: 'mariam', role: 'user' }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
};

// Initialize the service
export const initializeTodoService = () => {
  initializeUsers();
};

// Use relative paths for API endpoints when deploying to Vercel
export const API_BASE_URL = import.meta.env.PROD 
  ? '/api'  // In production, use relative path
  : 'http://localhost:5000/api'; // In development, use proxy path

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
  }
  throw new Error('Invalid response format');
};

// User operations
export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  if (!username?.trim() || !password?.trim()) {
    console.error('Username and password are required');
    return null;
  }

  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  try {
    console.log('Attempting to authenticate with:', {
      url: `${API_BASE_URL}/auth/login`,
      username: trimmedUsername,
      isProd: import.meta.env.PROD
    });

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        username: trimmedUsername, 
        password: trimmedPassword 
      }),
      credentials: 'include'
    });

    const data = await handleResponse(response);
    console.log('Auth successful:', data);
    return data;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

// Todo operations
export const saveTodo = async (todo: Omit<Todo, '_id' | 'id'>): Promise<Todo> => {
  try {
    console.log('Attempting to save todo with:', {
      url: `${API_BASE_URL}/todos`,
      todo
    });

    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: todo.task,
        rewards: {
          first: todo.rewards.first,
          second: todo.rewards.second
        },
        expiryDate: todo.expiryDate,
        assignedTo: todo.assignedTo,
        completed: false
      }),
    });

    const savedTodo = await handleResponse(response);
    // Ensure the response has both _id and id fields for compatibility
    savedTodo.id = savedTodo._id;
    console.log('Todo saved successfully:', savedTodo);
    return savedTodo;
  } catch (error) {
    console.error('Error saving todo:', error);
    throw error;
  }
};

export const getTodos = async (): Promise<Todo[]> => {
  try {
    console.log('Attempting to fetch todos from:', {
      url: `${API_BASE_URL}/todos`
    });

    const response = await fetch(`${API_BASE_URL}/todos`);
    const todos = await handleResponse(response);
    // Ensure each todo has both _id and id fields for compatibility
    return todos.map((todo: Todo) => ({ ...todo, id: todo._id }));
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
};

export const updateTodo = async (todoId: string, updates: Partial<Todo>): Promise<void> => {
  try {
    console.log('Attempting to update todo with:', {
      url: `${API_BASE_URL}/todos/${todoId}`,
      updates
    });

    const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    await handleResponse(response);
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

export const deleteTodo = async (todoId: string): Promise<void> => {
  try {
    console.log('Attempting to delete todo with:', {
      url: `${API_BASE_URL}/todos/${todoId}`
    });

    const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
      method: 'DELETE',
    });

    await handleResponse(response);
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};
