export interface Todo {
  id: number;
  task: string;
  completed: boolean;
  rewards: {
    first: string;
    second: string;
  };
  selectedReward?: string;
  expiryDate: string;
}

export type UserRole = 'admin' | 'user' | null;
