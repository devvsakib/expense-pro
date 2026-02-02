"use client";

import { useState, useEffect, useMemo } from "react";
import type { Expense, ExpenseStatus, UserProfile } from "@/app/types";

import Header from "@/components/Header";
import ExpenseList from "@/components/ExpenseList";
import ExpenseSummary from "@/components/ExpenseSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import ExpenseForm from "@/components/ExpenseForm";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// MOCK_USER will be replaced by onboarding flow later
const MOCK_USER: UserProfile = {
  name: "Alex",
  monthlyBudget: 3000,
};

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

  // Load state from localStorage
  useEffect(() => {
    setIsClient(true);
    try {
      const storedUser = localStorage.getItem("expense-tracker-user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(MOCK_USER);
        localStorage.setItem("expense-tracker-user", JSON.stringify(MOCK_USER));
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
          exp.id === editingExpense.id ? { ...exp, ...formValues } : exp
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
  
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((expense) =>
        expense.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter(
        (expense) => statusFilter === "all" || expense.status === statusFilter
      );
  }, [expenses, searchQuery, statusFilter]);

  if (!isClient || !user) {
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
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // TODO: Add Onboarding flow
  // if (!user.name) {
  //   return <OnboardingWizard />;
  // }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSaveExpense}
        expense={editingExpense}
      />
      
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-muted-foreground mb-8">
              Here's your financial overview for this month.
            </p>

            <ExpenseSummary budget={user.monthlyBudget} expenses={expenses} />

            <div className="mt-8">
              <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-2xl font-bold tracking-tight">
                  Your Expenses
                </h2>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search expenses..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select
                    onValueChange={(value: "all" | ExpenseStatus) =>
                      setStatusFilter(value)
                    }
                    defaultValue="all"
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={() => handleOpenForm()} className="whitespace-nowrap">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
                  </Button>
                </div>
              </div>
              <ExpenseList
                expenses={filteredExpenses}
                onDelete={handleDeleteExpense}
                onEdit={handleOpenForm}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
