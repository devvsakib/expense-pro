"use client";

import { useState, useEffect, useTransition } from "react";
import type { Task } from "@/app/types";
import { prioritizeTasks } from "@/ai/flows/ai-prioritize-tasks";
import type { TaskInput } from "@/ai/flows/ai-prioritize-tasks";
import { format } from "date-fns";

import Header from "@/components/Header";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import ProgressTracker from "@/components/ProgressTracker";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bot, Loader2, Lightbulb } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isAiLoading, startAiTransition] = useTransition();
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedTasks = localStorage.getItem("day-compass-tasks");
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          deadline: new Date(task.deadline),
        }));
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error("Failed to load tasks from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem("day-compass-tasks", JSON.stringify(tasks));
      } catch (error) {
        console.error("Failed to save tasks to localStorage", error);
      }
    }
  }, [tasks, isClient]);

  const handleAddTask = (formValues: {
    description: string;
    deadline: Date;
    importance: "low" | "medium" | "high";
    estimatedEffort: string;
  }) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      ...formValues,
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
    setAiReasoning(null);
  };

  const handleToggleComplete = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };
  
  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const handlePrioritize = () => {
    if (tasks.filter(t => !t.completed).length < 2) {
      setAiReasoning("You need at least two incomplete tasks to prioritize.");
      return;
    }

    startAiTransition(async () => {
      setAiReasoning(null);
      const uncompletedTasks = tasks.filter(t => !t.completed);
      const completedTasks = tasks.filter(t => t.completed);

      const aiInput: TaskInput = {
        tasks: uncompletedTasks.map((task) => ({
          ...task,
          deadline: format(task.deadline, "yyyy-MM-dd"),
        })),
      };

      try {
        const result = await prioritizeTasks(aiInput);
        
        const originalTaskMap = new Map(uncompletedTasks.map(t => [t.id, t]));
        
        const prioritizedUncompletedTasks = result.prioritizedTasks.map(
          (aiTask) => {
            // Find task by description, assuming descriptions are unique for this operation
            const foundTask = uncompletedTasks.find(t => t.description === aiTask.description);
            return foundTask;
          }
        ).filter(Boolean) as Task[];
        
        const allFoundIds = new Set(prioritizedUncompletedTasks.map(t => t.id));
        const missingTasks = uncompletedTasks.filter(t => !allFoundIds.has(t.id));
        
        if (missingTasks.length > 0) {
            console.error("Mismatch in prioritized tasks count.");
            setAiReasoning("AI prioritization resulted in a task mismatch. Re-displaying original order.");
            setTasks([...uncompletedTasks, ...completedTasks]);
        } else {
            setTasks([...prioritizedUncompletedTasks, ...completedTasks]);
            setAiReasoning(result.reasoning);
        }

      } catch (error) {
        console.error("AI prioritization failed:", error);
        setAiReasoning("Sorry, the AI prioritization failed. Please try again.");
      }
    });
  };

  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
           <div className="container flex h-16 items-center">
             <Skeleton className="h-6 w-36" />
             <div className="flex flex-1 items-center justify-end space-x-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
             </div>
           </div>
        </header>
        <main className="flex-1">
          <div className="container mx-auto py-8 px-4">
            <div className="grid gap-8 max-w-4xl mx-auto">
              <Skeleton className="h-64 w-full" />
              <div className="space-y-4">
                 <Skeleton className="h-10 w-48" />
                 <Skeleton className="h-24 w-full" />
                 <Skeleton className="h-20 w-full" />
                 <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header tasks={tasks} />
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4">
          <div className="grid gap-8 max-w-4xl mx-auto">
            <TaskForm onSubmit={handleAddTask} />
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Your Day's Tasks</h2>
                <Button onClick={handlePrioritize} disabled={isAiLoading || tasks.filter(t => !t.completed).length < 2}>
                  {isAiLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Bot className="mr-2 h-4 w-4" />
                  )}
                  Prioritize with AI
                </Button>
              </div>

              {aiReasoning && (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>AI Suggestion</AlertTitle>
                  <AlertDescription>{aiReasoning}</AlertDescription>
                </Alert>
              )}

              <ProgressTracker tasks={tasks} />
              
              <TaskList
                tasks={tasks}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                onUpdate={handleUpdateTask}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
