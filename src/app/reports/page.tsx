
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { UserProfile, Expense } from '@/app/types';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft, FileText, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { generateReport } from '@/ai/flows/ai-generate-report';
import { format, startOfWeek, startOfMonth, startOfYear, isAfter } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

export default function ReportsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year'>('month');
  const [aiReport, setAiReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

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
  
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses
      .filter((expense) => {
        if (dateFilter === "all") return true;
        const expenseDate = expense.date;
        if (dateFilter === "week") {
          return isAfter(expenseDate, startOfWeek(now));
        }
        if (dateFilter === "month") {
          return isAfter(expenseDate, startOfMonth(now));
        }
        if (dateFilter === "year") {
          return isAfter(expenseDate, startOfYear(now));
        }
        return true;
      });
  }, [expenses, dateFilter]);

  const handleGenerateReport = async () => {
    if (!user) return;
    setIsGenerating(true);
    setAiReport('');
    
    if (filteredExpenses.length === 0) {
        toast({
            variant: "destructive",
            title: "No Data",
            description: "There are no expenses in the selected period to generate a report.",
        });
        setIsGenerating(false);
        return;
    }

    const reportInput = {
      user: {
        name: user.name,
        monthlyBudget: user.monthlyBudget,
        currency: user.currency,
      },
      expenses: filteredExpenses.map((e) => ({
        title: e.title,
        amount: e.amount,
        category: e.category,
        date: format(e.date, "yyyy-MM-dd"),
      })),
    };

    try {
      const result = await generateReport(reportInput);
      setAiReport(result.report);
    } catch (error) {
      console.error("Failed to generate report", error);
      setAiReport(
        "**AI Report Failed**\n\nSorry, I couldn't generate the report. This might be due to reaching a request limit. Please try again later."
      );
       toast({
            variant: "destructive",
            title: "AI Report Failed",
            description: "Sorry, I couldn't generate the report. Please try again later.",
        });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Auto-generate report on first load for the default period ('month')
  useEffect(() => {
      if(user && expenses.length > 0) {
          handleGenerateReport();
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, expenses]);


  if (!isClient) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Welcome!</h2>
            <p className="text-muted-foreground">Please set up your profile first to view reports.</p>
            <Button asChild className="mt-4">
              <Link href="/">Go to Dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-1 flex flex-col max-w-4xl">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold">AI Spending Reports</h1>
                <p className="text-muted-foreground">Generate insights and analysis on your spending habits.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select
                    onValueChange={(value: "all" | "week" | "month" | "year") =>
                        setDateFilter(value)
                    }
                    defaultValue="month"
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                </Select>
                 <Button onClick={handleGenerateReport} disabled={isGenerating} className="w-full sm:w-auto">
                    {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                    {isGenerating ? 'Generating...' : 'Regenerate Report'}
                </Button>
            </div>
        </div>
        
        <Card className="flex-1">
            <CardHeader>
                <CardTitle>Your Report</CardTitle>
                <CardDescription>
                    An AI-generated analysis of your expenses for the selected period.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isGenerating && !aiReport ? (
                    <div className="flex items-center justify-center flex-col gap-4 text-center min-h-[300px]">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground">Generating your report... <br/>This might take a moment.</p>
                    </div>
                ) : aiReport ? (
                    <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: aiReport.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
                ) : (
                    <div className="flex items-center justify-center flex-col gap-4 text-center min-h-[300px]">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">Select a period and generate a report to get started.</p>
                    </div>
                )}
            </CardContent>
        </Card>

      </main>
    </div>
  );
}
