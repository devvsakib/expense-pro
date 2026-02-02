
'use client';

import { useState } from 'react';
import type { Expense, Task, UserProfile } from '@/app/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Sparkles, Loader2, ListTodo, Wallet, CheckCircle2, Circle, CalendarX2 } from 'lucide-react';
import { generateCalendarSummary } from '@/ai/flows/ai-generate-calendar-summary';
import { getCurrencySymbol } from '@/lib/utils';
import { Badge } from './ui/badge';

interface CalendarDayDetailsProps {
  selectedDate: Date;
  expenses: Expense[];
  tasks: Task[];
  user: UserProfile;
}

export default function CalendarDayDetails({ selectedDate, expenses, tasks, user }: CalendarDayDetailsProps) {
  const [aiSummary, setAiSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const currencySymbol = getCurrencySymbol(user.currency);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setAiSummary('');

    try {
      const result = await generateCalendarSummary({
        date: format(selectedDate, 'MMMM d, yyyy'),
        expenses: expenses.map(e => ({ title: e.title, amount: e.amount, category: e.category })),
        tasks: tasks.map(t => ({ description: t.description, completed: t.completed })),
        currencySymbol,
      });
      setAiSummary(result.summary);
    } catch (error) {
      console.error('Failed to generate summary', error);
      setAiSummary('Sorry, I couldn\'t generate a summary right now. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  if (!selectedDate) {
      return (
          <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center text-muted-foreground p-6">
                <CalendarX2 className="mx-auto h-12 w-12 mb-4" />
                <p>Select a day to see details.</p>
              </CardContent>
          </Card>
      );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
        <CardDescription>Events for this day.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-6 pt-0">
        {/* AI Summary Section */}
        <div className="space-y-2">
            <Button onClick={handleGenerateSummary} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                    <><Loader2 className="mr-2 animate-spin" /> Thinking...</>
                ) : (
                    <><Sparkles className="mr-2" /> Get AI Summary</>
                )}
            </Button>
            {aiSummary && (
                 <div className="text-sm p-3 rounded-md bg-secondary border whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
            )}
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
           <div className="space-y-6">
                {/* Tasks Section */}
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><ListTodo /> Tasks ({tasks.length})</h3>
                    {tasks.length > 0 ? (
                        <ul className="space-y-2">
                            {tasks.map(task => (
                                <li key={task.id} className="text-sm flex items-start gap-2">
                                    {task.completed ? <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" /> : <Circle className="h-4 w-4 mt-0.5 text-orange-500 shrink-0" />}
                                    <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                                        {task.description}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-muted-foreground">No tasks due today.</p>}
                </div>

                {/* Expenses Section */}
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><Wallet/> Expenses ({expenses.length})</h3>
                    {expenses.length > 0 ? (
                        <ul className="space-y-3">
                            {expenses.map(expense => (
                                <li key={expense.id} className="text-sm flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{expense.title}</p>
                                        <Badge variant="outline">{expense.category}</Badge>
                                    </div>
                                    <p className="font-mono font-medium">{currencySymbol}{expense.amount.toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-muted-foreground">No expenses logged today.</p>}
                </div>
           </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
