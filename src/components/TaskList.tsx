import type { Task } from "@/app/types";
import TaskItem from "./TaskItem";
import { Card, CardContent } from "@/components/ui/card";

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

export default function TaskList({ tasks, onToggleComplete, onDelete, onUpdate }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card className="text-center py-12 border-dashed">
        <CardContent>
          <h3 className="text-lg font-medium">No tasks yet!</h3>
          <p className="text-muted-foreground mt-1">Add a new task above to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
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
