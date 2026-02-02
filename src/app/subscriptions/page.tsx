
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { UserProfile, Expense } from '@/app/types';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Repeat } from 'lucide-react';
import { getCurrencySymbol } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function SubscriptionsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedUser = localStorage.getItem("expense-tracker-user");
      if (storedUser) setUser(JSON.parse(storedUser));

      const storedExpenses = localStorage.getItem("expense-tracker-expenses");
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses).map((e: any) => ({ ...e, date: new Date(e.date) })));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  const recurringExpenses = useMemo(() => {
    return expenses.filter(e => e.recurrence !== 'one-time').sort((a, b) => {
        const costA = a.recurrence === 'daily' ? a.amount * 30 : a.recurrence === 'weekly' ? a.amount * 4 : a.amount;
        const costB = b.recurrence === 'daily' ? b.amount * 30 : b.recurrence === 'weekly' ? b.amount * 4 : b.amount;
        return costB - costA;
    });
  }, [expenses]);
  
  const currencySymbol = user ? getCurrencySymbol(user.currency) : '$';

  const totalMonthlyCost = useMemo(() => {
      return recurringExpenses.reduce((total, expense) => {
          let monthlyCost = 0;
          switch (expense.recurrence) {
              case 'daily':
                  monthlyCost = expense.amount * 30; // Approximation
                  break;
              case 'weekly':
                  monthlyCost = expense.amount * 4.33; // More accurate approximation
                  break;
              case 'monthly':
                  monthlyCost = expense.amount;
                  break;
              default:
                  monthlyCost = 0;
          }
          return total + monthlyCost;
      }, 0)
  }, [recurringExpenses]);

  if (!isClient) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 flex items-center justify-center">
                <p>Loading...</p>
            </main>
        </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Welcome!</h2>
            <p className="text-muted-foreground">Please set up your profile first to use the subscriptions tracker.</p>
            <Button asChild className="mt-4">
              <Link href="/">Go to Dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4 max-w-4xl">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Subscriptions</h1>
            <p className="text-muted-foreground">A summary of your recurring expenses.</p>
          </div>
        </div>

        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Estimated Monthly Cost</CardTitle>
                <CardDescription>An approximation of your total recurring costs per month.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{currencySymbol}{totalMonthlyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Recurring Expense List</CardTitle>
            </CardHeader>
            <CardContent>
                {recurringExpenses.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Recurrence</TableHead>
                                <TableHead>Category</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recurringExpenses.map(expense => (
                                <TableRow key={expense.id}>
                                    <TableCell className="font-medium">{expense.title}</TableCell>
                                    <TableCell className="text-right">{currencySymbol}{expense.amount.toLocaleString()}</TableCell>
                                    <TableCell><Badge variant="secondary" className="capitalize">{expense.recurrence.replace('-', ' ')}</Badge></TableCell>
                                    <TableCell>{expense.category}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-16 border-dashed border-2 rounded-md">
                        <div className="flex flex-col items-center justify-center">
                            <Repeat className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold">No recurring expenses found.</h3>
                            <p className="text-muted-foreground mt-1 max-w-sm">
                                When you add an expense, set its recurrence to daily, weekly, or monthly to see it here.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
