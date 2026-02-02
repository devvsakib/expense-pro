
'use client';

import { useState, useEffect } from 'react';
import type { Task, TaskInput, TaskOutput } from '@/app/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Sparkles, ListTodo, Loader2, CalendarCheck, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import ProgressTracker from '@/components/ProgressTracker';
import DailySummary from '@/components/DailySummary';
import { prioritizeTasks } from '@/ai/flows/ai-prioritize-tasks';
import { useToast } from '@/hooks/use-toast';

export default function PlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isAiModalOpen, setAiModalOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState<TaskOutput | null>(null);
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    try {
      const storedTasks = localStorage.getItem('task-planner-tasks');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          deadline: new Date(task.deadline),
        }));
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('Failed to load tasks from localStorage', error);
      localStorage.removeItem('task-planner-tasks');
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem('task-planner-tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Failed to save tasks to localStorage', error);
      }
    }
  }, [tasks, isClient]);

  const handleAddTask = (formValues: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      completed: false,
      ...formValues,
    };
    setTasks(prev => [newTask, ...prev]);
    toast({
        title: "Task Added",
        description: `"${newTask.description}" has been added to your list.`,
    });
  };

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task =>
        task.id === id ? { ...task, ...updates } : task
    ));
  };

  const handlePrioritizeTasks = async () => {
    if (tasks.filter(t => !t.completed).length < 2) {
      toast({
        variant: "destructive",
        title: "Not enough tasks",
        description: "Add at least two incomplete tasks to use the AI prioritizer.",
      });
      return;
    }

    setIsPrioritizing(true);
    setAiResponse(null);
    setAiModalOpen(true);
    
    const taskInput: TaskInput = {
      tasks: tasks
        .filter(t => !t.completed)
        .map(t => ({
          description: t.description,
          deadline: format(t.deadline, 'yyyy-MM-dd'),
          importance: t.importance,
          estimatedEffort: t.estimatedEffort,
        })),
    };

    try {
      const result = await prioritizeTasks(taskInput);
      setAiResponse(result);
    } catch (error) {
      console.error("Failed to prioritize tasks", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not prioritize tasks. This might be due to a request limit. Please try again later.",
      });
      setAiModalOpen(false);
    } finally {
      setIsPrioritizing(false);
    }
  };

  const applyAiPrioritization = () => {
    if (!aiResponse) return;

    const orderedDescriptions = aiResponse.prioritizedTasks.map(t => t.description);
    const completedTasks = tasks.filter(t => t.completed);
    const nonCompletedTasks = tasks.filter(t => !t.completed);
    
    const orderedTasks = orderedDescriptions.map(desc => {
        return nonCompletedTasks.find(t => t.description === desc)!;
    }).filter(Boolean); // Filter out any potential undefined values
    
    // Add any tasks that were in the original list but not in the AI response
    const unhandledTasks = nonCompletedTasks.filter(t => !orderedDescriptions.includes(t.description));

    setTasks([...orderedTasks, ...unhandledTasks, ...completedTasks]);
    setAiModalOpen(false);
    toast({
        title: "Tasks Prioritized!",
        description: "Your task list has been reordered by the AI.",
    });
  };

  if (!isClient) {
      return <div>Loading...</div> // Add a skeleton loader here if you want
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              AI Task Planner
            </h1>
            <p className="text-muted-foreground mb-8">
              Organize your day with the power of AI.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="md:col-span-1">
                    <ProgressTracker tasks={tasks} />
                </div>
                <div className="md:col-span-2 flex flex-col sm:flex-row gap-2">
                    <Button onClick={handlePrioritizeTasks} className="w-full" disabled={tasks.filter(t => !t.completed).length < 2}>
                      <Sparkles className="mr-2" /> AI Prioritize Tasks
                    </Button>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <CalendarCheck className="mr-2" /> View Daily Summary
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-md">
                        <DailySummary tasks={tasks} />
                      </SheetContent>
                    </Sheet>
                </div>
            </div>

            <TaskForm onSubmit={handleAddTask} />

            <div className="mt-8">
              <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
                <ListTodo /> Your Tasks
              </h2>
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

      <Dialog open={isAiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" />
              AI Prioritization Suggestion
            </DialogTitle>
            <DialogDescription>
              Here's the plan I've come up with to maximize your productivity.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {isPrioritizing ? (
              <div className="flex items-center justify-center flex-col gap-4 text-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Analyzing your tasks...</p>
              </div>
            ) : aiResponse && (
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">My Reasoning</h3>
                        <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md">{aiResponse.reasoning}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Suggested Order</h3>
                        <ol className="space-y-2 list-decimal list-inside">
                           {aiResponse.prioritizedTasks.map((task, index) => (
                               <li key={index} className="p-3 bg-card rounded-md border text-sm">
                                   <strong className="font-medium">{task.description}</strong>
                                   <div className="text-xs text-muted-foreground mt-1 flex gap-x-4">
                                        <span>Deadline: {format(new Date(task.deadline), "MMM d")}</span>
                                        <span className="capitalize">Importance: {task.importance}</span>
                                        <span>Effort: {task.estimatedEffort}</span>
                                   </div>
                               </li>
                           ))}
                        </ol>
                    </div>
                </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiModalOpen(false)}>Cancel</Button>
            <Button onClick={applyAiPrioritization} disabled={!aiResponse}>
              Apply This Order <ArrowRight className="ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
