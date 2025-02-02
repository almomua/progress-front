import React, { useState } from 'react';
import * as todoService from '../services/todoService';

interface LoginProps {
  onLogin: (user: { username: string; role: string }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const user = await todoService.authenticateUser(username, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials. Try username: shoge, password: 123');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Try username: shoge, password: 123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-50">
      <div className="card max-w-md w-full mx-auto relative">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          Progress Track
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-modern relative z-50"
              placeholder="Enter your username (try: shoge)"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-modern relative z-50"
              placeholder="Enter your password (try: 123)"
              required
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-500/10 py-2 px-4 rounded-lg">
              {error}
            </div>
          )}
          <button type="submit" className="btn-primary w-full relative z-50">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};
