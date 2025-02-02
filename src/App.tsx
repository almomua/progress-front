import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import LoadingSpinner from './components/LoadingSpinner';
import { Todo, UserRole } from './types';
import * as todoService from './services/todoService';
import './App.css';
import './index.css';

const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [user, setUser] = useState<{ username: string; role: UserRole } | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize the service and load todos
  useEffect(() => {
    const loadTodos = async () => {
      try {
        todoService.initializeTodoService();
        const savedTodos = await todoService.getTodos();
        console.log('Loaded todos:', savedTodos);
        setTodos(Array.isArray(savedTodos) ? savedTodos : []);
      } catch (error) {
        console.error('Error loading todos:', error);
        setTodos([]);
      } finally {
        setLoading(false);
      }
    };
    loadTodos();
  }, []);

  const handleLogin = async (authenticatedUser: { username: string; role: UserRole }) => {
    if (authenticatedUser && authenticatedUser.username && authenticatedUser.role) {
      setUser(authenticatedUser);
      // Reload todos after login
      try {
        const savedTodos = await todoService.getTodos();
        console.log('Reloaded todos after login:', savedTodos);
        setTodos(Array.isArray(savedTodos) ? savedTodos : []);
      } catch (error) {
        console.error('Error loading todos after login:', error);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTodos([]);
  };

  const handleAddTodo = async (newTodo: Omit<Todo, '_id' | 'id'>) => {
    try {
      const savedTodo = await todoService.saveTodo(newTodo);
      setTodos(prevTodos => [...prevTodos, savedTodo]);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleRemoveTodo = async (id: string) => {
    try {
      await todoService.deleteTodo(id);
      setTodos(prevTodos => prevTodos.filter(todo => (todo._id || todo.id) !== id));
    } catch (error) {
      console.error('Error removing todo:', error);
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      const todoToUpdate = todos.find(todo => (todo._id || todo.id) === id);
      if (todoToUpdate) {
        const updates = { completed: !todoToUpdate.completed };
        await todoService.updateTodo(id, updates);
        setTodos(prevTodos =>
          prevTodos.map(todo => ((todo._id || todo.id) === id ? { ...todo, ...updates } : todo))
        );
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleSelectReward = async (id: string, reward: string) => {
    try {
      const todoToUpdate = todos.find(todo => (todo._id || todo.id) === id);
      if (todoToUpdate) {
        const updates = { selectedReward: reward };
        await todoService.updateTodo(id, updates);
        setTodos(prevTodos =>
          prevTodos.map(todo => ((todo._id || todo.id) === id ? { ...todo, ...updates } : todo))
        );
      }
    } catch (error) {
      console.error('Error selecting reward:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Filter todos for the current user
  const userTodos = user.role === 'admin' 
    ? todos 
    : todos.filter(todo => {
        console.log('Filtering todo:', todo, 'user:', user.username);
        return todo.assignedTo === user.username;
      });

  console.log('Filtered todos for user:', user.username, userTodos);
  console.log('All todos:', todos);

  return user.role === 'admin' ? (
    <AdminDashboard
      todos={todos}
      onAddTodo={handleAddTodo}
      onRemoveTodo={handleRemoveTodo}
      onLogout={handleLogout}
      username={user.username}
    />
  ) : (
    <UserDashboard
      todos={userTodos}
      onToggleTodo={handleToggleTodo}
      onSelectReward={handleSelectReward}
      onLogout={handleLogout}
      username={user.username}
    />
  );
};

export default App;