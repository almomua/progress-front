import React, { useState, useRef, useEffect } from 'react';
import { Todo } from '../types';
import '../styles/animations.css';
import avatar from '../assets/avatar.png'; // Import the avatar image

interface UserDashboardProps {
  todos: Todo[];
  onToggleTodo: (id: string) => void;
  onSelectReward: (id: string, reward: string) => void;
  onLogout: () => void;
  username: string;
}

interface Point {
  x: number;
  y: number;
}

interface BrushStroke {
  points: Point[];
  color: string;
  width: number;
}

interface ScratchState {
  isDrawing: boolean;
  strokes: BrushStroke[];
  currentStroke?: BrushStroke;
}

const calculateProgress = (expiryDate: string): { progress: number; daysLeft: number } => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const createdDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const totalDuration = expiry.getTime() - createdDate.getTime();
  const elapsed = now.getTime() - createdDate.getTime();
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return { progress, daysLeft };
};

const getProgressColor = (progress: number): string => {
  if (progress >= 90) return 'bg-red-600';
  if (progress >= 70) return 'bg-red-400';
  return 'bg-red-300';
};

const calculateTimeRemaining = (expiryDate: string): string => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

// Function to draw a smooth line between points
const drawSmoothLine = (
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  width: number
) => {
  if (points.length < 2) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  // Use quadratic curves to smooth the line
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }

  // Draw the last segment
  if (points.length > 1) {
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  ctx.stroke();
};

export const UserDashboard: React.FC<UserDashboardProps> = ({
  todos,
  onToggleTodo,
  onSelectReward,
  onLogout,
  username
}) => {
  const [scratchStates, setScratchStates] = useState<Record<string, ScratchState>>({});
  const canvasRefs = useRef<Record<string, HTMLCanvasElement>>({});
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const initCanvas = (todoId: string, canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      canvasRefs.current[todoId] = canvas;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Redraw existing strokes
        const state = scratchStates[todoId];
        if (state?.strokes) {
          state.strokes.forEach(stroke => {
            drawSmoothLine(ctx, stroke.points, stroke.color, stroke.width);
          });
        }
      }
    }
  };

  const handleDrawStart = (todoId: string, e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRefs.current[todoId];
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newStroke: BrushStroke = {
      points: [{ x, y }],
      color: 'rgba(239, 68, 68, 0.5)', // red-500 with 50% opacity
      width: 8
    };

    setScratchStates(prev => ({
      ...prev,
      [todoId]: {
        isDrawing: true,
        strokes: [...(prev[todoId]?.strokes || [])],
        currentStroke: newStroke
      }
    }));
  };

  const handleDrawMove = (todoId: string, e: React.MouseEvent<HTMLCanvasElement>) => {
    const state = scratchStates[todoId];
    if (!state?.isDrawing || !state.currentStroke) return;

    const canvas = canvasRefs.current[todoId];
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPoint = { x, y };
    const newStroke = {
      ...state.currentStroke,
      points: [...state.currentStroke.points, newPoint]
    };

    // Update state
    setScratchStates(prev => {
      const newState = {
        ...prev[todoId],
        currentStroke: newStroke
      };
      return { ...prev, [todoId]: newState };
    });

    // Draw the updated stroke
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawSmoothLine(
        ctx,
        newStroke.points,
        newStroke.color,
        newStroke.width
      );
    }
  };

  const handleDrawEnd = (todoId: string) => {
    const state = scratchStates[todoId];
    if (!state?.currentStroke) return;

    setScratchStates(prev => {
      const currentStrokes = prev[todoId]?.strokes || [];
      const newState: ScratchState = {
        isDrawing: false,
        strokes: state.currentStroke ? [...currentStrokes, state.currentStroke] : currentStrokes,
        currentStroke: undefined
      };

      // Check if we have 3 or more strokes
      if (newState.strokes.length >= 3 && !todos.find(t => t._id === todoId)?.completed) {
        onToggleTodo(todoId);
      }

      return { ...prev, [todoId]: newState };
    });
  };

  // console.log('UserDashboard rendering with todos:', todos);
  // console.log('UserDashboard props:', { todos, username });

  return (
    <div className="fixed inset-0 overflow-hidden bg-gray-900">
      <div className="absolute inset-0 overflow-hidden">
        {/* Add floating bubbles */}
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
      </div>

      <div className="relative h-full overflow-y-auto py-6">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8 sticky top-0 bg-gray-900/80 backdrop-blur-sm py-4 z-10">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 relative flex-shrink-0">
                <img 
                  src={avatar} 
                  alt="User Avatar" 
                  className="absolute inset-0 w-full h-full object-cover rounded-full border-2 border-purple-500"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Task Progress</h1>
                <p className="text-gray-400">Welcome, {username}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              Logout
            </button>
          </div>

          <div className="bg-gray-700 rounded-lg shadow-lg p-6">
            <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {Array.isArray(todos) && todos.length > 0 ? (
                todos.map(todo => {
                  const { progress } = calculateProgress(todo.expiryDate);
                  const timeRemaining = calculateTimeRemaining(todo.expiryDate);
                  const isExpired = new Date(todo.expiryDate) <= currentTime;
                  const todoId = todo._id; 
                  
                  return (
                    <div
                      key={todoId}
                      className={`bg-gray-800 rounded-lg p-4 relative overflow-hidden transition-all duration-300 card-hover
                        ${todo.completed ? 'opacity-75' : 'hover:bg-gray-750'}
                        ${isExpired && !todo.completed ? 'border-2 border-red-500' : ''}`}
                    >
                      {!todo.completed && (
                        <canvas
                          ref={(canvas) => initCanvas(todoId, canvas)}
                          className="absolute inset-0 cursor-crosshair"
                          width={800}
                          height={200}
                          onMouseDown={(e) => handleDrawStart(todoId, e)}
                          onMouseMove={(e) => handleDrawMove(todoId, e)}
                          onMouseUp={() => handleDrawEnd(todoId)}
                          onMouseLeave={() => handleDrawEnd(todoId)}
                        />
                      )}
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                          <span className={`text-white ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                            {todo.task}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`text-sm ${isExpired ? 'text-red-500 font-bold' : 'text-gray-300'}`}>
                            {timeRemaining}
                          </span>
                          <span className="text-xs text-gray-400">
                            Due: {new Date(todo.expiryDate).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-900 rounded-full h-2.5 mb-4">
                        <div
                          className={`h-full rounded-full ${getProgressColor(progress)}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {todo.completed && !todo.selectedReward && (
                        <div className="space-y-2 animate-fadeIn">
                          <div className="flex items-center justify-center space-x-2 text-green-400 mb-4">
                            <span className="text-xl">🎉</span>
                            <p className="text-lg font-medium">Great job! Choose your reward:</p>
                            <span className="text-xl">🎉</span>
                          </div>
                          <div className="flex space-x-4 justify-center">
                            <button
                              onClick={() => onSelectReward(todoId, todo.rewards.first)}
                              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg transform hover:scale-105 transition-all duration-200"
                            >
                              {todo.rewards.first}
                            </button>
                            <button
                              onClick={() => onSelectReward(todoId, todo.rewards.second)}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg transform hover:scale-105 transition-all duration-200"
                            >
                              {todo.rewards.second}
                            </button>
                          </div>
                        </div>
                      )}

                      {todo.completed && todo.selectedReward && (
                        <div className="text-center text-green-400 mt-2">
                          <p>🎁 Reward chosen: {todo.selectedReward}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p className="text-lg">No tasks assigned yet</p>
                  <p className="text-sm mt-2">Check back later for new tasks</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
