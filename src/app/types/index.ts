export type Task = {
  id: string;
  description: string;
  deadline: Date;
  importance: 'low' | 'medium' | 'high';
  estimatedEffort: string;
  completed: boolean;
  startTime?: string;
  endTime?: string;
};

export type Importance = 'low' | 'medium' | 'high';

export const importanceLevels: Importance[] = ['low', 'medium', 'high'];
