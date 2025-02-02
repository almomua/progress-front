import React, { useState } from 'react';
import { Todo } from '../types';

interface AdminDashboardProps {
  todos: Todo[];
  onAddTodo: (task: string, firstReward: string, secondReward: string, expiryDate: string, assignedTo: string) => void;
  onRemoveTodo: (id: number) => void;
  onLogout: () => void;
  username: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  todos, 
  onAddTodo, 
  onRemoveTodo,
  onLogout,
  username 
}) => {
  const [newTask, setNewTask] = useState('');
  const [firstReward, setFirstReward] = useState('');
  const [secondReward, setSecondReward] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim() && firstReward.trim() && secondReward.trim() && expiryDate && assignedTo.trim()) {
      onAddTodo(newTask.trim(), firstReward.trim(), secondReward.trim(), expiryDate, assignedTo.trim());
      setNewTask('');
      setFirstReward('');
      setSecondReward('');
      setExpiryDate('');
      setAssignedTo('');
    }
  };

  // Calculate minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  console.log('AdminDashboard rendering with todos:', todos);

  return (
    <div className="min-h-screen bg-gray-900 py-6 fixed inset-0 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Welcome, {username}</p>
          </div>
          <button 
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
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
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                required
                placeholder="Enter task description"
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
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  required
                  placeholder="Enter first reward"
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
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  required
                  placeholder="Enter second reward"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-300">
                  Due Date
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={minDate}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-300">
                  Assign To
                </label>
                <input
                  type="text"
                  id="assignedTo"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  required
                  placeholder="Enter username"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>

        {/* Task List */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">All Tasks</h2>
          <div className="space-y-4 max-h-[calc(100vh-36rem)] overflow-y-auto">
            {Array.isArray(todos) && todos.length > 0 ? (
              todos.map(todo => (
                <div
                  key={todo.id}
                  className={`bg-gray-700 rounded-lg p-4 flex items-center justify-between
                    ${todo.completed ? 'opacity-75' : ''}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-white ${todo.completed ? 'line-through' : ''}`}>
                        {todo.task}
                      </span>
                      <span className="text-sm text-gray-400">
                        Assigned to: {todo.assignedTo}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Due: {new Date(todo.expiryDate).toLocaleString()}
                    </div>
                    {todo.completed && todo.selectedReward && (
                      <div className="text-sm text-green-400 mt-1">
                        Reward chosen: {todo.selectedReward}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveTodo(todo.id)}
                    className="ml-4 text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p className="text-lg">No tasks created yet</p>
                <p className="text-sm mt-2">Add a new task using the form above</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
