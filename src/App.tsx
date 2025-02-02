import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import LoadingSpinner from './components/LoadingSpinner';
import { Todo, UserRole } from './types';
import * as todoService from './services/todoService';
import './App.css';
import './index.css';
import './styles/LoadingSpinner.css';
import './styles/animations.css';

const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [user, setUser] = useState<{ username: string; role: UserRole }>({ username: '', role: null });
  const [loading, setLoading] = useState(true);

  // Initialize the service and load todos
  useEffect(() => {
    const loadTodos = async () => {
      try {
        todoService.initializeTodoService();
        const savedTodos = await todoService.getTodos();
        setTodos(savedTodos);
      } catch (error) {
        console.error('Error loading todos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTodos();
  }, []);

  // Save todos whenever they change
  useEffect(() => {
    const saveTodosToServer = async () => {
      if (todos.length > 0) {
        try {
          await todoService.saveTodos(todos);
        } catch (error) {
          console.error('Error saving todos:', error);
        }
      }
    };
    saveTodosToServer();
  }, [todos]);

  const handleLogin = async (username: string, password: string) => {
    try {
      const authenticatedUser = await todoService.authenticateUser(username, password);
      if (authenticatedUser) {
        setUser({ username, role: authenticatedUser.role });
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    }
  };

  const handleLogout = () => {
    setUser({ username: '', role: null });
  };

  const addTodo = async (task: string, firstReward: string, secondReward: string, expiryDate: string) => {
    try {
      const newTodo = await todoService.addTodo({
        task,
        completed: false,
        rewards: {
          first: firstReward,
          second: secondReward
        },
        selectedReward: '',
        expiryDate
      });
      setTodos([...todos, newTodo]);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const removeTodo = async (todoId: number) => {
    try {
      await todoService.removeTodo(todoId);
      setTodos(todos.filter(todo => todo.id !== todoId));
    } catch (error) {
      console.error('Error removing todo:', error);
    }
  };

  const toggleTodo = async (id: number) => {
    try {
      const updatedTodos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      const updatedTodo = updatedTodos.find(todo => todo.id === id);
      if (updatedTodo) {
        await todoService.updateTodo(updatedTodo);
        setTodos(updatedTodos);
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const selectReward = async (id: number, reward: string) => {
    try {
      const updatedTodos = todos.map(todo =>
        todo.id === id ? { ...todo, selectedReward: reward } : todo
      );
      const updatedTodo = updatedTodos.find(todo => todo.id === id);
      if (updatedTodo) {
        await todoService.updateTodo(updatedTodo);
        setTodos(updatedTodos);
      }
    } catch (error) {
      console.error('Error selecting reward:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user.role) {
    return <Login onLogin={handleLogin} />;
  }

  if (user.role === 'admin') {
    return (
      <AdminDashboard
        todos={todos}
        onAddTodo={addTodo}
        onRemoveTodo={removeTodo}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <UserDashboard
      todos={todos}
      onToggleTodo={toggleTodo}
      onSelectReward={selectReward}
      onLogout={handleLogout}
    />
  );
};

export default App;