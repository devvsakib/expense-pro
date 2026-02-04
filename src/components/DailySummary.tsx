
import type { Task } from "@/app/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export interface DailySummaryProps {
  tasks: Task[];
}

export default function DailySummary({ tasks }: DailySummaryProps) {
  const todoTasks = tasks.filter((task) => task.status === 'todo');
  const inprogressTasks = tasks.filter((task) => task.status === 'inprogress');
  const doneTasks = tasks.filter((task) => task.status === 'done');

  return (
    <>
      <SheetHeader>
        <SheetTitle>Daily Summary</SheetTitle>
        <SheetDescription>
          Here's a look at your day's tasks.
        </SheetDescription>
      </SheetHeader>
      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Circle className="mr-2 h-5 w-5 text-orange-500" />
              To Do ({todoTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todoTasks.length > 0 ? (
              <ul className="space-y-2">
                {todoTasks.map((task) => (
                  <li key={task.id} className="font-medium">
                    {task.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No tasks to do.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Loader2 className="mr-2 h-5 w-5 text-blue-500 animate-spin" />
              In Progress ({inprogressTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inprogressTasks.length > 0 ? (
              <ul className="space-y-2">
                {inprogressTasks.map((task) => (
                  <li key={task.id} className="font-medium">
                    {task.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No tasks in progress.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
              Done ({doneTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {doneTasks.length > 0 ? (
              <ul className="space-y-2">
                {doneTasks.map((task) => (
                  <li key={task.id} className="text-muted-foreground line-through">
                    {task.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No tasks completed yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
