
'use client';

import { useMemo } from 'react';
import type { Expense, Task } from '@/app/types';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Circle, CheckCircle2, Loader2 } from 'lucide-react';
import { getCurrencySymbol } from '@/lib/utils';

interface FullCalendarProps {
  currentMonth: Date;
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  expenses: Expense[];
  tasks: Task[];
  currency: string;
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function FullCalendar({
  currentMonth,
  selectedDate,
  onDateSelect,
  expenses,
  tasks,
  currency
}: FullCalendarProps) {
  const currencySymbol = getCurrencySymbol(currency);
  const daysInMonth = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const getEventsForDay = (day: Date) => {
    const dayTasks = tasks.filter(task => isSameDay(task.deadline, day));
    const dayExpenses = expenses.filter(expense => isSameDay(expense.date, day));
    return { tasks: dayTasks, expenses: dayExpenses };
  };

  return (
    <div className="grid grid-cols-7 border-t border-l border-border rounded-lg overflow-hidden">
      {/* Header */}
      {weekDays.map(day => (
        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-r border-b border-border bg-card">
          {day}
        </div>
      ))}

      {/* Days */}
      {daysInMonth.map(day => {
        const isCurrent = isSameMonth(day, currentMonth);
        const isSel = selectedDate ? isSameDay(day, selectedDate) : false;
        const isTod = isToday(day);
        const { tasks: dayTasks, expenses: dayExpenses } = getEventsForDay(day);

        return (
          <div
            key={day.toString()}
            onClick={() => onDateSelect(day)}
            className={cn(
              'relative h-40 flex flex-col p-2 border-r border-b border-border cursor-pointer transition-colors',
              isCurrent ? 'bg-card' : 'bg-muted/50',
              isSel && 'bg-primary/10 ring-2 ring-primary z-10',
              'hover:bg-accent/50'
            )}
          >
            <span
              className={cn(
                'font-medium self-end text-sm',
                isTod && 'flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground',
                isSel && !isTod && 'text-primary',
                !isCurrent && 'text-muted-foreground/50'
              )}
            >
              {format(day, 'd')}
            </span>
            <div className="flex-1 overflow-y-auto no-scrollbar mt-1 space-y-1">
              {dayTasks.map(task => (
                 <div key={task.id} className="flex items-center gap-1.5 p-1 rounded-sm text-xs bg-secondary/80 hover:bg-secondary">
                    {task.status === 'done' ? <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" /> : task.status === 'inprogress' ? <Loader2 className="h-3 w-3 text-blue-500 shrink-0 animate-spin" /> : <Circle className="h-3 w-3 text-orange-500 shrink-0" />}
                    <span className={cn("truncate", task.status === 'done' && 'line-through')}>{task.description}</span>
                 </div>
              ))}
              {dayExpenses.map(expense => (
                 <div key={expense.id} className="flex items-center justify-between gap-1.5 p-1 rounded-sm text-xs bg-secondary/80 hover:bg-secondary">
                     <span className="truncate font-medium">{expense.title}</span>
                     <span className="font-mono whitespace-nowrap">{currencySymbol}{expense.amount}</span>
                 </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
