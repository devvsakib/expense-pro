
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Task, TaskInput, TaskOutput, UserProfile, TaskStatus } from '@/app/types';
import { format, addHours, isBefore, isAfter } from 'date-fns';
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
import { Sparkles, ListTodo, Loader2, CalendarCheck, ArrowRight, ArrowLeft, PlusCircle } from 'lucide-react';
import Header from '@/components/Header';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import ProgressTracker from '@/components/ProgressTracker';
import DailySummary from '@/components/DailySummary';
import { prioritizeTasks } from '@/ai/flows/ai-prioritize-tasks';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function PlannerPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isAiModalOpen, setAiModalOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState<TaskOutput | null>(null);
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    try {
      const storedUser = localStorage.getItem('expense-tracker-user');
      if (storedUser) setUser(JSON.parse(storedUser));

      const storedTasks = localStorage.getItem('task-planner-tasks');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks).map((task: any) => {
          const newStatus = task.status || (task.completed ? 'done' : 'todo');
          const newTask = {
            ...task,
            title: task.title || task.description, // Handle old data
            description: task.title ? task.description : undefined,
            deadline: new Date(task.deadline),
            status: newStatus,
          };
          delete newTask.completed; // remove old property
          return newTask;
        });
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
      localStorage.removeItem('expense-tracker-user');
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
  
  // Effect for task reminders
  useEffect(() => {
    if (!isClient || !user?.notifications?.enabled || Notification.permission !== 'granted') {
      return;
    }
    
    const NOTIFIED_TASKS_KEY = 'task-planner-notified-ids';

    const checkAndNotify = () => {
      const notifiedTaskIds: string[] = JSON.parse(localStorage.getItem(NOTIFIED_TASKS_KEY) || '[]');
      const now = new Date();
      const in24Hours = addHours(now, 24);
      
      const newNotifications: string[] = [];

      tasks.forEach(task => {
        const deadline = task.deadline; 
        
        if (
          task.status !== 'done' &&
          !notifiedTaskIds.includes(task.id) &&
          isAfter(deadline, now) &&
          isBefore(deadline, in24Hours)
        ) {
          new Notification('Task Reminder', {
            body: `Your task "${task.title}" is due soon!`,
            icon: '/icons/icon-192x192.png',
            tag: task.id, // Using a tag prevents duplicate notifications for the same task
          });
          newNotifications.push(task.id);
        }
      });

      if (newNotifications.length > 0) {
        const updatedNotifiedIds = [...notifiedTaskIds, ...newNotifications];
        localStorage.setItem(NOTIFIED_TASKS_KEY, JSON.stringify(updatedNotifiedIds));
      }
    };
    
    // Check for notifications every minute.
    const intervalId = setInterval(checkAndNotify, 60000);
    
    // Run on initial load after a small delay
    setTimeout(checkAndNotify, 2000); 

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [tasks, user?.notifications?.enabled, isClient]);

  const handleOpenForm = (task?: Task) => {
    setEditingTask(task || null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = (formValues: Omit<Task, 'id' | 'status'>) => {
    if (editingTask) {
        // Update existing task
        setTasks(tasks.map(task =>
            task.id === editingTask.id ? { ...task, ...formValues } : task
        ));
        toast({ title: "Task Updated", description: `"${formValues.title}" has been updated.` });
    } else {
        // Add new task
        const newTask: Task = {
            id: crypto.randomUUID(),
            status: 'todo',
            ...formValues,
        };
        setTasks(prev => [newTask, ...prev]);
        toast({ title: "Task Added", description: `"${newTask.title}" has been added to your 'To Do' list.` });
    }
    handleCloseForm();
  };

  const handleUpdateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, status } : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast({
        title: "Task Deleted",
        description: "The task has been removed from your board.",
    });
  };
  
  const handlePrioritizeTasks = async () => {
    if (!user?.apiKey) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Please add your Google AI API key in the Settings page to use this feature.",
      });
      return;
    }
    
    if (tasks.filter(t => t.status !== 'done').length < 2) {
      toast({
        variant: "destructive",
        title: "Not enough tasks",
        description: "Add at least two active tasks to use the AI prioritizer.",
      });
      return;
    }

    setIsPrioritizing(true);
    setAiResponse(null);
    setAiModalOpen(true);
    
    const taskInput: TaskInput = {
      tasks: tasks
        .filter(t => t.status !== 'done')
        .map(t => ({
          title: t.title,
          description: t.description,
          deadline: format(t.deadline, 'yyyy-MM-dd'),
          importance: t.importance,
          estimatedEffort: t.estimatedEffort,
        })),
    };

    try {
      const result = await prioritizeTasks(taskInput);
      setAiResponse(result);
    } catch (error: any) {
      console.error("Failed to prioritize tasks", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "The AI request failed. Please check if your API key is correct in Settings, or try again later.",
      });
      setAiModalOpen(false);
    } finally {
      setIsPrioritizing(false);
    }
  };

  const applyAiPrioritization = () => {
    if (!aiResponse) return;

    const orderedTitles = aiResponse.prioritizedTasks.map(t => t.title);
    const doneTasks = tasks.filter(t => t.status === 'done');
    const activeTasks = tasks.filter(t => t.status !== 'done');
    
    const orderedTasks = orderedTitles.map(title => {
        return activeTasks.find(t => t.title === title)!;
    }).filter(Boolean);
    
    const unhandledTasks = activeTasks.filter(t => !orderedTitles.includes(t.title));

    setTasks([...orderedTasks, ...unhandledTasks, ...doneTasks].map(t => ({...t, status: 'todo'} as Task)));
    setAiModalOpen(false);
    toast({
        title: "Tasks Prioritized!",
        description: "Your active tasks have been reordered and moved to 'To Do'.",
    });
  };
  
  const todoTasks = useMemo(() => tasks.filter(t => t.status === 'todo'), [tasks]);
  const inprogressTasks = useMemo(() => tasks.filter(t => t.status === 'inprogress'), [tasks]);
  const doneTasks = useMemo(() => tasks.filter(t => t.status === 'done'), [tasks]);

  if (!isClient) {
      return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSaveTask}
        task={editingTask}
      />
      <main className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Task Board
            </h1>
            <p className="text-muted-foreground mb-8">
              Organize your day with a Kanban-style task board.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="md:col-span-1">
                    <ProgressTracker tasks={tasks} />
                </div>
                <div className="md:col-span-2 flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => handleOpenForm()} variant="outline" className="w-full">
                        <PlusCircle className="mr-2" /> Add New Task
                    </Button>
                    <Button onClick={handlePrioritizeTasks} className="w-full" disabled={tasks.filter(t => t.status !== 'done').length < 2}>
                      <Sparkles className="mr-2" /> AI Prioritize Active Tasks
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

          </div>
        </div>

        <div className="flex-1 container mx-auto px-4 pb-8 overflow-x-auto">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-[1000px] h-full">
              <TaskList
                  title="To Do"
                  tasks={todoTasks}
                  onUpdateStatus={handleUpdateTaskStatus}
                  onDelete={handleDeleteTask}
                  onEdit={handleOpenForm}
              />
              <TaskList
                  title="In Progress"
                  tasks={inprogressTasks}
                  onUpdateStatus={handleUpdateTaskStatus}
                  onDelete={handleDeleteTask}
                  onEdit={handleOpenForm}
              />
              <TaskList
                  title="Done"
                  tasks={doneTasks}
                  onUpdateStatus={handleUpdateTaskStatus}
                  onDelete={handleDeleteTask}
                  onEdit={handleOpenForm}
              />
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
              Here's the plan I've come up with to maximize your productivity. Applying this will move all active tasks to 'To Do'.
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
                                   <strong className="font-medium">{task.title}</strong>
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
