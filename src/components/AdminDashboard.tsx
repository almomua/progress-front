import React, { useState } from 'react';
import { Todo } from '../types';

interface AdminDashboardProps {
  todos: Todo[];
  onAddTodo: (task: string, firstReward: string, secondReward: string, expiryDate: string) => void;
  onRemoveTodo: (id: number) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  todos, 
  onAddTodo, 
  onRemoveTodo,
  onLogout 
}) => {
  const [newTask, setNewTask] = useState('');
  const [firstReward, setFirstReward] = useState('');
  const [secondReward, setSecondReward] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim() && firstReward.trim() && secondReward.trim() && expiryDate) {
      onAddTodo(newTask, firstReward, secondReward, expiryDate);
      setNewTask('');
      setFirstReward('');
      setSecondReward('');
      setExpiryDate('');
    }
  };

  // Calculate minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-black py-6">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <button onClick={onLogout}>Logout</button>
        </div>

        {/* Add New Task Form */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Add New Task</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="task" className="block text-sm font-medium text-gray-300">
                Task Description
              </label>
              <input
                type="text"
                id="task"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="mt-1 block w-full"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstReward" className="block text-sm font-medium text-gray-300">
                  First Reward Option
                </label>
                <input
                  type="text"
                  id="firstReward"
                  value={firstReward}
                  onChange={(e) => setFirstReward(e.target.value)}
                  className="mt-1 block w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="secondReward" className="block text-sm font-medium text-gray-300">
                  Second Reward Option
                </label>
                <input
                  type="text"
                  id="secondReward"
                  value={secondReward}
                  onChange={(e) => setSecondReward(e.target.value)}
                  className="mt-1 block w-full"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-300">
                Expiry Date
              </label>
              <input
                type="date"
                id="expiryDate"
                value={expiryDate}
                min={minDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="mt-1 block w-full"
                required
              />
            </div>
            <button type="submit" className="w-full">
              Add Task
            </button>
          </form>
        </div>

        {/* Task List */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Manage Tasks</h2>
          <div className="space-y-4">
            {todos.map(todo => (
              <div 
                key={todo.id} 
                className="bg-gray-700 rounded-lg p-4 flex items-center justify-between group"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg ${todo.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                      {todo.task}
                    </h3>
                    <span className="text-sm text-gray-400">
                      Due: {new Date(todo.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Rewards: {todo.rewards.first} | {todo.rewards.second}
                    {todo.selectedReward && (
                      <span className="ml-2 text-green-400">
                        (Selected: {todo.selectedReward})
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onRemoveTodo(todo.id)}
                  className="ml-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  Remove
                </button>
              </div>
            ))}
            {todos.length === 0 && (
              <p className="text-center text-gray-400">No tasks available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
