
import type { Task } from "@/app/types";
import TaskItem from "./TaskItem";
import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

export default function TaskList({ tasks, onToggleComplete, onDelete, onUpdate }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card className="text-center py-16 border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center">
          <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">No tasks yet!</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            Add a new task above to get started with the AI Planner.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const sortedTasks = [...tasks].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });


  return (
    <div className="space-y-4">
      {sortedTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
