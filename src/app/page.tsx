
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Expense, ExpenseStatus, UserProfile, WidgetKey } from "@/app/types";
import {
    expenseCategories
} from "@/app/types";
import {
    format,
    startOfWeek,
    startOfMonth,
    startOfYear,
    isAfter,
} from "date-fns";
import { useToast } from "@/hooks/use-toast";

import Header from "@/components/Header";
import ExpenseList from "@/components/ExpenseList";
import ExpenseSummary from "@/components/ExpenseSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    PlusCircle,
    Search,
    FileText,
    Upload,
    LayoutGrid,
} from "lucide-react";
import ExpenseForm from "@/components/ExpenseForm";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import SpendingChart from "@/components/SpendingChart";
import CategoryPieChart from "@/components/CategoryPieChart";
import Onboarding from "@/components/Onboarding";
import CategoryBudgets from "@/components/CategoryBudgets";
import Link from "next/link";
import BudgetProgress from "@/components/BudgetProgress";
import ExpenseImportDialog from "@/components/ExpenseImportDialog";
import DashboardWidgetSelector from "@/components/DashboardWidgetSelector";
import { cn } from "@/lib/utils";


export default function Home() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [isFormOpen, setFormOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | ExpenseStatus>(
        "all",
    );
    const [dateFilter, setDateFilter] = useState<
        "all" | "week" | "month" | "year"
    >("all");
    const [categoryFilter, setCategoryFilter] = useState<"all" | string>("all");
    const [isImportOpen, setImportOpen] = useState(false);
    const [isWidgetSelectorOpen, setWidgetSelectorOpen] = useState(false);

    const { toast } = useToast();

    // Load state from localStorage
    useEffect(() => {
        setIsClient(true);
        try {
            const storedUser = localStorage.getItem("expense-tracker-user");
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);

                // Migration from separate summaries back to a single one
                if (parsedUser.dashboardWidgets && typeof parsedUser.dashboardWidgets.pendingSummary !== 'undefined') {
                    parsedUser.dashboardWidgets.expenseSummary = parsedUser.dashboardWidgets.pendingSummary;
                    delete parsedUser.dashboardWidgets.pendingSummary;
                    delete parsedUser.dashboardWidgets.upcomingSummary;
                    delete parsedUser.dashboardWidgets.recurringSummary;
                }
                
                if (!parsedUser.dashboardWidgets) {
                    parsedUser.dashboardWidgets = {
                        budgetProgress: true,
                        expenseSummary: true,
                        categoryBudgets: true,
                        spendingChart: true,
                        categoryPieChart: false,
                    };
                }
                setUser(parsedUser);
            }

            const storedExpenses = localStorage.getItem(
                "expense-tracker-expenses",
            );
            if (storedExpenses) {
                const parsedExpenses = JSON.parse(storedExpenses).map(
                    (expense: any) => ({
                        ...expense,
                        date: new Date(expense.date),
                    }),
                );
                setExpenses(parsedExpenses);
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            localStorage.removeItem("expense-tracker-user");
            localStorage.removeItem("expense-tracker-expenses");
        }
    }, []);

    // Save user profile to localStorage
    useEffect(() => {
        if (isClient && user) {
            try {
                localStorage.setItem("expense-tracker-user", JSON.stringify(user));
            } catch (error) {
                console.error("Failed to save user to localStorage", error);
            }
        }
    }, [user, isClient]);

    // Save expenses to localStorage
    useEffect(() => {
        if (isClient) {
            try {
                localStorage.setItem(
                    "expense-tracker-expenses",
                    JSON.stringify(expenses),
                );
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
                    exp.id === editingExpense.id
                        ? { ...exp, ...formValues, id: exp.id }
                        : exp,
                ),
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

    const handleImportExpenses = (imported: Omit<Expense, "id">[]) => {
        const newExpenses: Expense[] = imported.map((exp) => ({
            ...exp,
            id: crypto.randomUUID(),
        }));
        setExpenses((prev) => [...prev, ...newExpenses]);
    };

    const handleOnboardingComplete = (profile: UserProfile) => {
        setUser(profile);
    };

    const handleWidgetToggle = (widget: WidgetKey, enabled: boolean) => {
        if (!user) return;
        const updatedUser = {
            ...user,
            dashboardWidgets: {
                ...user.dashboardWidgets,
                [widget]: enabled,
            }
        };
        setUser(updatedUser);
    };

    const allCategories = useMemo(() => [
        ...expenseCategories,
        ...(user?.customCategories?.map(c => c.name) || [])
    ].sort(), [user?.customCategories]);


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
                expense.title.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .filter(
                (expense) =>
                    statusFilter === "all" || expense.status === statusFilter,
            )
            .filter(
                (expense) =>
                    categoryFilter === "all" || expense.category === categoryFilter,
            );
    }, [expenses, searchQuery, statusFilter, dateFilter, categoryFilter]);

    const currentMonthExpenses = useMemo(() => {
        const now = new Date();
        const monthStart = startOfMonth(now);
        return expenses.filter(expense => isAfter(expense.date, monthStart));
    }, [expenses]);

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

    const ExpenseSummaries = () => (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <ExpenseSummary user={user} expenses={expenses} type="pending" />
            <ExpenseSummary user={user} expenses={expenses} type="upcoming" />
            <ExpenseSummary user={user} expenses={expenses} type="recurring" />
        </div>
    );

    const widgetComponents: Record<WidgetKey, { component: React.ElementType, props?: any }> = {
      budgetProgress: { component: BudgetProgress, props: { user, expenses: currentMonthExpenses } },
      expenseSummary: { component: ExpenseSummaries },
      categoryBudgets: { component: CategoryBudgets, props: { user, expenses: currentMonthExpenses } },
      spendingChart: { component: SpendingChart, props: { expenses: expenses, currency: user.currency } },
      categoryPieChart: { component: CategoryPieChart, props: { expenses: expenses, currency: user.currency, customCategories: user.customCategories || [] } },
    };

    const enabledWidgets = Object.keys(widgetComponents).filter(
        key => user.dashboardWidgets?.[key as WidgetKey]
    ) as WidgetKey[];

    return (
        <div
            className="flex flex-col min-h-screen bg-background"
            suppressHydrationWarning
        >
            <Header />

            {/* Floating Button for Add Expense */}
            <div className="fixed bottom-10 right-5 z-50">
                <span
                    itemType="button"
                    onClick={() => handleOpenForm()}
                    className="whitespace-nowrap w-14 h-14 rounded-full md:hidden bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary hover:shadow-xl active:scale-95 transition-transform cursor-pointer"
                >
                    <PlusCircle size={34} className="text-2xl!" />
                </span>
            </div>

            <ExpenseForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSubmit={handleSaveExpense}
                expense={editingExpense}
                user={user}
                expenses={expenses}
            />

            <ExpenseImportDialog
                isOpen={isImportOpen}
                onClose={() => setImportOpen(false)}
                onImport={handleImportExpenses}
                userCategories={user.customCategories?.map((c) => c.name) || []}
            />
            
            <Sheet open={isWidgetSelectorOpen} onOpenChange={setWidgetSelectorOpen}>
                <SheetContent>
                    <DashboardWidgetSelector user={user} onWidgetToggle={handleWidgetToggle} />
                </SheetContent>
            </Sheet>

            <main className="flex-1">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-1">
                                Welcome back, {user.name}!
                            </h1>
                            <p className="text-muted-foreground">
                                Here's your financial overview.
                            </p>
                        </div>
                        <div className="flex flex-row w-full md:w-auto shrink-0 gap-2">
                            <Button
                                asChild
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                <Link href="/reports">
                                    <FileText className="mr-2 h-4 w-4" />{" "}
                                    <span className="hidden sm:block">
                                        View Reports
                                    </span>
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={() => setImportOpen(true)}
                            >
                                <Upload className="mr-2 h-4 w-4" />{" "}
                                <span className="hidden sm:block">
                                    Import Expenses
                                </span>
                            </Button>
                             <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={() => setWidgetSelectorOpen(true)}
                            >
                                <LayoutGrid className="mr-2 h-4 w-4" />{" "}
                                <span className="hidden sm:block">
                                    Customize Widgets
                                </span>
                            </Button>
                            <Button
                                onClick={() => handleOpenForm()}
                                className="whitespace-nowrap w-full sm:w-auto hidden md:inline-flex"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Expense
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 pb-8">
                        {enabledWidgets.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {enabledWidgets.map(widgetKey => {
                                    const Widget = widgetComponents[widgetKey].component;
                                    const props = widgetComponents[widgetKey].props || {};
                                    const isSummary = widgetKey === 'expenseSummary';
                                    
                                    return (
                                        <div key={widgetKey} className={cn(isSummary && 'md:col-span-2 xl:col-span-3')}>
                                            <Widget {...props} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        
                        <div>
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
                                            onChange={(e) =>
                                                setSearchQuery(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <Select
                                        onValueChange={(
                                            value:
                                                | "all"
                                                | "week"
                                                | "month"
                                                | "year",
                                        ) => setDateFilter(value as any)}
                                        defaultValue="all"
                                    >
                                        <SelectTrigger className="w-full sm:w-[160px]">
                                            <SelectValue placeholder="Filter by date" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Time
                                            </SelectItem>
                                            <SelectItem value="week">
                                                This Week
                                            </SelectItem>
                                            <SelectItem value="month">
                                                This Month
                                            </SelectItem>
                                            <SelectItem value="year">
                                                This Year
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                     <Select
                                        onValueChange={(value) => setCategoryFilter(value)}
                                        defaultValue="all"
                                    >
                                        <SelectTrigger className="w-full sm:w-[180px]">
                                            <SelectValue placeholder="Filter by category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {allCategories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        onValueChange={(
                                            value: "all" | ExpenseStatus,
                                        ) => setStatusFilter(value)}
                                        defaultValue="all"
                                    >
                                        <SelectTrigger className="w-full sm:w-[160px]">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Statuses
                                            </SelectItem>
                                            <SelectItem value="completed">
                                                Completed
                                            </SelectItem>
                                            <SelectItem value="pending">
                                                Pending
                                            </SelectItem>
                                            <SelectItem value="upcoming">
                                                Upcoming
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <ExpenseList
                                expenses={filteredExpenses}
                                onDelete={handleDeleteExpense}
                                onEdit={handleOpenForm}
                                user={user}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
