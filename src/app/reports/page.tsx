'use client';

import { useState, useEffect, useMemo } from 'react';
import type { UserProfile, Expense } from '@/app/types';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { generateReport } from '@/ai/flows/ai-generate-report';
import { format, startOfWeek, startOfMonth, startOfYear, isAfter } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import ReportSummary from '@/components/ReportSummary';
import ReportTrendChart from '@/components/ReportTrendChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import TopCategories from '@/components/TopCategories';

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
    if (!isClient) return []; // Ensure we don't filter on server
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
  }, [expenses, dateFilter, isClient]);

  const handleGenerateReport = async () => {
    if (!user) return;

    if (!user.apiKey) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Please add your Google AI API key in the Settings page to use this feature.",
      });
      return;
    }
    
    if (filteredExpenses.length === 0) {
        toast({
            variant: "destructive",
            title: "No Data",
            description: "There are no expenses in the selected period to generate a report.",
        });
        return;
    }

    setIsGenerating(true);
    setAiReport('');

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
    } catch (error: any) {
      console.error("Failed to generate report", error);
      const description = "The AI request failed. Please check if your API key is correct in Settings, or try again later.";
      setAiReport(
        `**AI Report Failed**\n\n${description}`
      );
       toast({
            variant: "destructive",
            title: "AI Report Failed",
            description: description,
        });
    } finally {
      setIsGenerating(false);
    }
  };

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
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-1 flex-col max-w-7xl">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold">Spending Reports</h1>
                <p className="text-muted-foreground">Analyze your spending habits with data and AI.</p>
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
            </div>
        </div>
        
        {filteredExpenses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                  <ReportSummary user={user} expenses={filteredExpenses} dateFilter={dateFilter} />
                  <ReportTrendChart expenses={filteredExpenses} currency={user.currency} dateFilter={dateFilter} />
              </div>
              <div className="lg:col-span-1 space-y-8">
                  <Card>
                      <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="text-primary"/> AI Report</CardTitle>
                            <Button onClick={handleGenerateReport} disabled={isGenerating} size="sm">
                                {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                                {isGenerating ? 'Generating...' : 'Generate'}
                            </Button>
                        </div>
                          <CardDescription>
                              Get personalized insights on your spending for this period.
                          </CardDescription>
                      </CardHeader>
                      <CardContent className="min-h-[150px]">
                          {isGenerating ? (
                              <div className="flex items-center justify-center flex-col gap-4 text-center h-full">
                                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                  <p className="text-muted-foreground">Generating your report...</p>
                              </div>
                          ) : aiReport ? (
                              <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: aiReport.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
                          ) : (
                              <div className="flex items-center justify-center h-full text-center">
                                  <p className="text-sm text-muted-foreground">Click 'Generate' to get an AI-powered analysis.</p>
                              </div>
                          )}
                      </CardContent>
                  </Card>
                  <CategoryPieChart expenses={filteredExpenses} currency={user.currency} customCategories={user.customCategories || []} />
                  <TopCategories user={user} expenses={filteredExpenses} />
              </div>
          </div>
        ) : (
          <Card className="text-center py-16 border-dashed border-2 col-span-full">
            <CardContent className="flex flex-col items-center justify-center">
                <h3 className="text-xl font-semibold">No expenses in this period.</h3>
                <p className="text-muted-foreground mt-1 max-w-sm">
                    Select a different time period or add some expenses to see your report.
                </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
