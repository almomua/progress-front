export interface Todo {
  _id?: string;
  id?: string;  // Keep for backward compatibility
  task: string;
  completed: boolean;
  rewards: {
    first: string;
    second: string;
  };
  selectedReward?: string;
  expiryDate: string;
  assignedTo: string;
}

export type UserRole = 'admin' | 'user' | null;
