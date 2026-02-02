
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Expense, ExpenseStatus, UserProfile } from "@/app/types";
import { format, startOfWeek, startOfMonth, startOfYear, isAfter } from "date-fns";
import { useToast } from "@/hooks/use-toast";

import Header from "@/components/Header";
import ExpenseList from "@/components/ExpenseList";
import ExpenseSummary from "@/components/ExpenseSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, FileText } from "lucide-react";
import ExpenseForm from "@/components/ExpenseForm";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SpendingChart from "@/components/SpendingChart";
import CategoryPieChart from "@/components/CategoryPieChart";
import Onboarding from "@/components/Onboarding";
import CategoryBudgets from "@/components/CategoryBudgets";
import Link from "next/link";


export default function Home() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ExpenseStatus>(
    "all"
  );
  const [dateFilter, setDateFilter] = useState<
    "all" | "week" | "month" | "year"
  >("all");
  
  const { toast } = useToast();

  // Load state from localStorage
  useEffect(() => {
    setIsClient(true);
    try {
      const storedUser = localStorage.getItem("expense-tracker-user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const storedExpenses = localStorage.getItem("expense-tracker-expenses");
      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses).map(
          (expense: any) => ({
            ...expense,
            date: new Date(expense.date),
          })
        );
        setExpenses(parsedExpenses);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      localStorage.removeItem("expense-tracker-user");
      localStorage.removeItem("expense-tracker-expenses");
    }
  }, []);

  // Save expenses to localStorage
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem("expense-tracker-expenses", JSON.stringify(expenses));
      } catch (error) {
        console.error("Failed to save expenses to localStorage", error);
      }
    }
  }, [expenses, isClient]);

  const handleOpenForm = (expense?: Expense) => {
    setEditingExpense(expense || null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingExpense(null);
  };

  const handleSaveExpense = (formValues: Omit<Expense, "id">) => {
    if (editingExpense) {
      // Update existing expense
      setExpenses(
        expenses.map((exp) =>
          exp.id === editingExpense.id ? { ...exp, ...formValues, id: exp.id } : exp
        )
      );
    } else {
      // Add new expense
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        ...formValues,
      };
      setExpenses((prev) => [newExpense, ...prev]);
    }
    handleCloseForm();
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem("expense-tracker-user", JSON.stringify(profile));
  };
  
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
      })
      .filter((expense) =>
        expense.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter(
        (expense) => statusFilter === "all" || expense.status === statusFilter
      );
  }, [expenses, searchQuery, statusFilter, dateFilter]);


  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container flex h-16 items-center">
            <Skeleton className="h-6 w-36" />
          </div>
        </header>
        <main className="flex-1">
          <div className="container mx-auto py-8 px-4">
            <div className="grid gap-8 max-w-6xl mx-auto">
              <Skeleton className="h-12 w-1/2" />
              <div className="grid md:grid-cols-3 gap-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSaveExpense}
        expense={editingExpense}
        user={user}
        expenses={expenses}
      />
      
      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto h-full flex flex-col px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-8">
                <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-1">
                    Welcome back, {user.name}!
                </h1>
                <p className="text-muted-foreground">
                    Here's your financial overview.
                </p>
                </div>
                <div className="flex w-full md:w-auto shrink-0 gap-2">
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                      <Link href="/reports">
                          <FileText className="mr-2 h-4 w-4" /> View Reports
                      </Link>
                    </Button>
                    <Button onClick={() => handleOpenForm()} className="whitespace-nowrap w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8 flex-1 overflow-hidden">
                {/* Main Content */}
                <div className="md:col-span-2 xl:col-span-3 h-full flex flex-col">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <h2 className="text-2xl font-bold tracking-tight self-start">
                        Your Expenses
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                            placeholder="Search expenses..."
                            className="pl-9 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select
                            onValueChange={(value: "all" | "week" | "month" | "year") =>
                            setDateFilter(value as any)
                            }
                            defaultValue="all"
                        >
                            <SelectTrigger className="w-full sm:w-[160px]">
                            <SelectValue placeholder="Filter by date" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            onValueChange={(value: "all" | ExpenseStatus) =>
                            setStatusFilter(value)
                            }
                            defaultValue="all"
                        >
                            <SelectTrigger className="w-full sm:w-[160px]">
                            <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                    </div>
                     <div className="flex-1 overflow-y-auto no-scrollbar">
                        <ExpenseList
                            expenses={filteredExpenses}
                            onDelete={handleDeleteExpense}
                            onEdit={handleOpenForm}
                            user={user}
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="hidden md:block md:col-span-1 xl:col-span-1 h-full overflow-y-auto no-scrollbar">
                    <div className="space-y-6">
                        <ExpenseSummary user={user} expenses={filteredExpenses} />
                        <CategoryBudgets user={user} expenses={filteredExpenses} />
                        <SpendingChart expenses={filteredExpenses} currency={user.currency} />
                        <CategoryPieChart expenses={filteredExpenses} currency={user.currency} customCategories={user.customCategories || []} />
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
