
"use client";

import type { Task } from "@/app/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Trash2, Calendar, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

const importanceVariantMap = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
} as const;


export default function TaskItem({ task, onToggleComplete, onDelete, onUpdate }: TaskItemProps) {
  return (
    <Card className={cn("transition-all hover:shadow-md animate-in fade-in-0 zoom-in-95", task.completed && "bg-muted/50")}>
      <CardContent className="p-4 flex flex-col md:flex-row items-start gap-4">
        <div className="flex items-center space-x-4 flex-1">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={() => onToggleComplete(task.id)}
            aria-label={`Mark task ${task.description} as complete`}
            className="mt-1"
          />
          <div className="grid gap-1.5 flex-1">
            <label
              htmlFor={`task-${task.id}`}
              className={cn(
                "font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.description}
            </label>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(task.deadline, "MMM d")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{task.estimatedEffort}</span>
              </div>
              <Badge variant={importanceVariantMap[task.importance]} className="capitalize">
                  {task.importance}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto pt-2 md:pt-0">
          <Input
            type="time"
            value={task.startTime ?? ''}
            onChange={(e) => onUpdate(task.id, { startTime: e.target.value })}
            className="w-full text-xs h-9"
            aria-label="Start time"
            disabled={task.completed}
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="time"
            value={task.endTime ?? ''}
            onChange={(e) => onUpdate(task.id, { endTime: e.target.value })}
            className="w-full text-xs h-9"
            aria-label="End time"
            disabled={task.completed}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete task</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the task "{task.description}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(task.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
