
"use client";

import { useState } from "react";
import type { Task, TaskStatus } from "@/app/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Calendar, Clock, MoreHorizontal, ArrowRight, Check, Edit, MessageSquareText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const importanceVariantMap = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
} as const;


export default function TaskItem({ task, onUpdateStatus, onDelete, onEdit }: TaskItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <Card className={cn("transition-all hover:shadow-md animate-in fade-in-0 zoom-in-95", task.status === 'done' && "bg-card/50 opacity-70")}>
      <CardContent className="p-3 flex flex-col gap-3">
        <div>
           <p className={cn(
              "font-semibold leading-tight",
              task.status === 'done' && "line-through text-muted-foreground"
            )}>
            {task.title}
          </p>
          {task.description && (
            <div className="flex items-start gap-1.5 mt-2 text-sm text-muted-foreground">
                <MessageSquareText className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="whitespace-pre-wrap">{task.description}</p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(task.deadline, "MMM d")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedEffort}</span>
            </div>
            <Badge variant={importanceVariantMap[task.importance]} className="capitalize text-xs px-1.5 py-0">
                {task.importance}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 w-full pt-2 border-t border-dashed">
          <div className="flex items-center gap-1">
            <Input
              type="time"
              value={task.startTime ?? ''}
              onChange={(e) => onEdit({ ...task, startTime: e.target.value })}
              className="w-28 text-xs h-8"
              aria-label="Start time"
              disabled={task.status === 'done'}
            />
            <span className="text-muted-foreground text-xs">-</span>
            <Input
              type="time"
              value={task.endTime ?? ''}
              onChange={(e) => onEdit({ ...task, endTime: e.target.value })}
              className="w-28 text-xs h-8"
              aria-label="End time"
              disabled={task.status === 'done'}
            />
          </div>
          
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Task options</span>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}><Edit className="mr-2"/> Edit Task</DropdownMenuItem>
                <DropdownMenuSeparator />
                {task.status !== 'todo' && <DropdownMenuItem onClick={() => onUpdateStatus(task.id, 'todo')}><ArrowRight className="mr-2 rotate-180"/> Move to To Do</DropdownMenuItem>}
                {task.status !== 'inprogress' && <DropdownMenuItem onClick={() => onUpdateStatus(task.id, 'inprogress')}><ArrowRight className="mr-2"/> Move to In Progress</DropdownMenuItem>}
                {task.status !== 'done' && <DropdownMenuItem onClick={() => onUpdateStatus(task.id, 'done')}><Check className="mr-2"/> Move to Done</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => setIsDeleteDialogOpen(true)}
                >
                    <Trash2 className="mr-2" />
                    <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the task "{task.title}". This action cannot be undone.
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
