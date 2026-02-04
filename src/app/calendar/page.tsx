
'use client';

import { useState, useEffect, useMemo } from 'react';
import { isSameDay, addMonths, subMonths, format } from 'date-fns';
import type { Expense, Task, UserProfile } from '@/app/types';
import Link from 'next/link';
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import CalendarDayDetails from '@/components/CalendarDayDetails';
import FullCalendar from '@/components/FullCalendar';
import { Button } from '@/components/ui/button';


export default function CalendarPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    setIsClient(true);
    try {
      const storedUser = localStorage.getItem('expense-tracker-user');
      if (storedUser) setUser(JSON.parse(storedUser));

      const storedExpenses = localStorage.getItem('expense-tracker-expenses');
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses).map((e: any) => ({ ...e, date: new Date(e.date) })));
      }

      const storedTasks = localStorage.getItem('task-planner-tasks');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks).map((task: any) => {
          const newStatus = task.status || (task.completed ? 'done' : 'todo');
          const newTask = {
            ...task,
            deadline: new Date(task.deadline),
            status: newStatus,
          };
          delete newTask.completed;
          return newTask;
        });
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
    }
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const filteredEvents = useMemo(() => {
    if (!selectedDate) return { expenses: [], tasks: [] };
    return {
      expenses: expenses.filter(e => isSameDay(e.date, selectedDate)),
      tasks: tasks.filter(t => isSameDay(t.deadline, selectedDate)),
    };
  }, [selectedDate, expenses, tasks]);

  if (!isClient || !user) {
    return <div>Loading...</div>; // Or a proper skeleton loader
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-1">
        <div className="max-w-7xl mx-auto h-full">
            <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-8">
                    <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                        <CalendarIcon className="h-8 w-8" />
                        Calendar
                    </h1>
                     <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={handlePrevMonth} aria-label="Previous month">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-xl font-semibold w-40 text-center">{format(currentMonth, 'MMMM yyyy')}</h2>
                        <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="Next month">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-3">
                     <FullCalendar
                        currentMonth={currentMonth}
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        expenses={expenses}
                        tasks={tasks}
                        currency={user.currency}
                    />
                </div>
                <div className="xl:col-span-1">
                    {selectedDate && <CalendarDayDetails selectedDate={selectedDate} expenses={filteredEvents.expenses} tasks={filteredEvents.tasks} user={user} />}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
