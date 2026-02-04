
import type { Task, TaskStatus } from "@/app/types";
import TaskItem from "./TaskItem";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TaskListProps {
  title: string;
  tasks: Task[];
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

export default function TaskList({ title, tasks, onUpdateStatus, onDelete, onUpdate }: TaskListProps) {
  
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return (
    <div className="bg-muted/50 rounded-lg h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold tracking-tight flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-medium bg-background text-muted-foreground rounded-full px-2.5 py-0.5">{tasks.length}</span>
        </h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {sortedTasks.length > 0 ? (
            sortedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdateStatus={onUpdateStatus}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-sm text-muted-foreground pt-10">
              <p>No tasks in this column.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
