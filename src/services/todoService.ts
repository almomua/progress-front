import { Todo } from '../types';

const TODOS_KEY = 'todos';
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
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// User operations
export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  if (!username?.trim() || !password?.trim()) {
    console.error('Username and password are required');
    return null;
  }

  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  try {
    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        username: trimmedUsername, 
        password: trimmedPassword 
      }),
    });
    
    const data = await response.json();
    console.log('Auth response:', { status: response.status, data });
    
    if (!response.ok) {
      console.error('Auth failed:', data.error);
      return null;
    }
    
    if (!data.username || !data.role) {
      console.error('Invalid response format:', data);
      return null;
    }

    return {
      username: data.username,
      role: data.role
    };
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
    const data = await response.json();
    console.log('Fetched todos:', data);
    if (!Array.isArray(data)) {
      console.error('Invalid todos data format:', data);
      return [];
    }
    // Ensure all todos have an assignedTo field
    return data.map(todo => ({
      ...todo,
      assignedTo: todo.assignedTo || ''
    }));
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
};

export const saveTodos = async (todos: Todo[]): Promise<void> => {
  try {
    // Ensure all todos have an assignedTo field before saving
    const validatedTodos = todos.map(todo => ({
      ...todo,
      assignedTo: todo.assignedTo || ''
    }));

    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedTodos),
    });

    if (!response.ok) {
      throw new Error('Failed to save todos');
    }
    console.log('Todos saved successfully');
  } catch (error) {
    console.error('Error saving todos:', error);
    throw error;
  }
};

export const addTodo = async (todo: Omit<Todo, 'id'>): Promise<Todo> => {
  try {
    const currentTodos = await getTodos();
    const newTodo: Todo = {
      ...todo,
      id: Date.now(),
      assignedTo: todo.assignedTo || '' // Ensure assignedTo is present
    };
    await saveTodos([...currentTodos, newTodo]);
    return newTodo;
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  }
};

export const updateTodo = async (updatedTodo: Todo): Promise<void> => {
  try {
    const currentTodos = await getTodos();
    const newTodos = currentTodos.map(todo => 
      todo.id === updatedTodo.id 
        ? { ...updatedTodo, assignedTo: updatedTodo.assignedTo || '' } // Ensure assignedTo is present
        : todo
    );
    await saveTodos(newTodos);
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

export const removeTodo = async (todoId: number): Promise<void> => {
  try {
    const currentTodos = await getTodos();
    const newTodos = currentTodos.filter(todo => todo.id !== todoId);
    await saveTodos(newTodos);
  } catch (error) {
    console.error('Error removing todo:', error);
    throw error;
  }
};
