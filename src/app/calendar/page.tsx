
'use client';

import { useState, useEffect, useMemo } from 'react';
import { isSameDay } from 'date-fns';
import type { Expense, Task, UserProfile } from '@/app/types';
import Link from 'next/link';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import Header from '@/components/Header';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import CalendarDayDetails from '@/components/CalendarDayDetails';

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
        setTasks(JSON.parse(storedTasks).map((t: any) => ({ ...t, deadline: new Date(t.deadline) })));
      }
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
    }
  }, []);

  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    expenses.forEach(e => dates.add(e.date.toDateString()));
    tasks.forEach(t => dates.add(t.deadline.toDateString()));
    return Array.from(dates).map(d => new Date(d));
  }, [expenses, tasks]);

  const eventModifier = {
    'with-event': eventDates,
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
        <div className="max-w-6xl mx-auto h-full">
            <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                        <CalendarIcon className="h-8 w-8" />
                        Calendar View
                    </h1>
                    <p className="text-muted-foreground">A unified view of your tasks and expenses.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100%-120px)]">
                <Card className="lg:col-span-2 flex justify-center items-start pt-6">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        modifiers={eventModifier}
                        modifiersClassNames={{
                            'with-event': 'day-with-event',
                        }}
                    />
                </Card>
                <div className="lg:col-span-1 h-full">
                    {selectedDate && <CalendarDayDetails selectedDate={selectedDate} expenses={filteredEvents.expenses} tasks={filteredEvents.tasks} user={user} />}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
