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

// User operations
export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  if (!username?.trim() || !password?.trim()) {
    console.error('Username and password are required');
    return null;
  }

  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  try {
    console.log('Attempting to authenticate with:', API_BASE_URL);
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      console.error('Auth failed:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      console.error('Failed to save todo:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const savedTodo = await response.json();
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
    const response = await fetch(`${API_BASE_URL}/todos`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      console.error('Failed to fetch todos:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const todos = await response.json();
    // Ensure each todo has both _id and id fields for compatibility
    return todos.map((todo: Todo) => ({ ...todo, id: todo._id }));
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
};

export const updateTodo = async (todoId: string, updates: Partial<Todo>): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      console.error('Failed to update todo:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

export const deleteTodo = async (todoId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      console.error('Failed to delete todo:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};
