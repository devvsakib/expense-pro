import type { Task } from "@/app/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export interface DailySummaryProps {
  tasks: Task[];
}

export default function DailySummary({ tasks }: DailySummaryProps) {
  const completedTasks = tasks.filter((task) => task.completed);
  const remainingTasks = tasks.filter((task) => !task.completed);

  return (
    <>
      <SheetHeader>
        <SheetTitle>Daily Summary</SheetTitle>
        <SheetDescription>
          Here's a look at your day so far.
        </SheetDescription>
      </SheetHeader>
      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
              Completed Tasks ({completedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completedTasks.length > 0 ? (
              <ul className="space-y-2">
                {completedTasks.map((task) => (
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Circle className="mr-2 h-5 w-5 text-orange-500" />
              Remaining Tasks ({remainingTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {remainingTasks.length > 0 ? (
              <ul className="space-y-2">
                {remainingTasks.map((task) => (
                  <li key={task.id} className="font-medium">
                    {task.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">All tasks completed! Great job!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
