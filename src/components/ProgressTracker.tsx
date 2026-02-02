import type { Task } from "@/app/types";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ProgressTrackerProps {
  tasks: Task[];
}

export default function ProgressTracker({ tasks }: ProgressTrackerProps) {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Daily Progress</CardTitle>
        <CardDescription>{completedTasks} of {totalTasks} tasks completed</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={progressPercentage} aria-label={`${Math.round(progressPercentage)}% complete`} />
      </CardContent>
    </Card>
  );
}
