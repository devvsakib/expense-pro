
'use client';

import { useState, useEffect } from 'react';
import type { SavingsGoal, UserProfile, Expense } from '@/app/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, Eye, PiggyBank, FilePenLine, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { generateSavingsPlan } from '@/ai/flows/ai-savings-coach';
import { getCurrencySymbol } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  goalName: z.string().min(3, "Please enter a name for your goal."),
  goalAmount: z.coerce.number().positive("Please enter a positive amount."),
});

type FormValues = z.infer<typeof formSchema>;

const contributionSchema = z.object({
    amount: z.coerce.number().positive("Please enter a positive amount."),
});
type ContributionValues = z.infer<typeof contributionSchema>;

export default function SavingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isViewPlanDialogOpen, setViewPlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const { toast } = useToast();

  // Load data from localStorage
  useEffect(() => {
    setIsClient(true);
    try {
      const storedUser = localStorage.getItem("expense-tracker-user");
      if (storedUser) setUser(JSON.parse(storedUser));

      const storedExpenses = localStorage.getItem("expense-tracker-expenses");
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses).map((e: any) => ({ ...e, date: new Date(e.date) })));
      }

      const storedGoals = localStorage.getItem("expense-tracker-savings-goals");
      if (storedGoals) {
        setSavingsGoals(JSON.parse(storedGoals).map((g: any) => ({ ...g, createdAt: new Date(g.createdAt) })));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  // Save goals to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("expense-tracker-savings-goals", JSON.stringify(savingsGoals));
    }
  }, [savingsGoals, isClient]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goalName: "",
      goalAmount: undefined,
    },
  });
  
  const contributionForm = useForm<ContributionValues>({
      resolver: zodResolver(contributionSchema),
      defaultValues: {
          amount: undefined,
      }
  });

  const currencySymbol = user ? getCurrencySymbol(user.currency) : '$';

  const handleGeneratePlan = async (values: FormValues) => {
    if (!user) return;
    setIsGenerating(true);

    const planInput = {
      user: {
        name: user.name,
        monthlyBudget: user.monthlyBudget,
        currency: user.currency,
      },
      expenses: expenses.map((e) => ({
        title: e.title,
        amount: e.amount,
        category: e.category,
        date: format(e.date, "yyyy-MM-dd"),
      })),
      goal: {
        name: values.goalName,
        amount: values.goalAmount,
      },
    };

    try {
      const result = await generateSavingsPlan(planInput);
      const newGoal: SavingsGoal = {
        id: crypto.randomUUID(),
        name: values.goalName,
        amount: values.goalAmount,
        currentAmount: 0,
        plan: result.plan,
        createdAt: new Date().toISOString(),
      };
      setSavingsGoals(prev => [newGoal, ...prev]);
      toast({ title: "Savings Plan Created!", description: "Your new savings goal has been added." });
      setCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to generate savings plan", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not generate a plan. This may be due to a request limit. Please try again later.",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleViewPlan = (plan: string) => {
    setSelectedPlan(plan);
    setViewPlanDialogOpen(true);
  }

  const handleDeleteGoal = (id: string) => {
    setSavingsGoals(goals => goals.filter(goal => goal.id !== id));
    toast({
        title: "Goal Deleted",
        description: "The savings goal has been removed.",
    })
  }

  const handleAddContribution = (values: ContributionValues) => {
      if (!editingGoal) return;

      setSavingsGoals(goals => goals.map(g => 
        g.id === editingGoal.id 
        ? { ...g, currentAmount: Math.min(g.amount, (g.currentAmount || 0) + values.amount) } // Cap at goal amount
        : g
    ));
    
    toast({ title: "Contribution Added!", description: `You've added ${currencySymbol}${values.amount} to your goal.` });
    setEditingGoal(null);
    contributionForm.reset();
  }
  
  const handleOpenContribution = (goal: SavingsGoal) => {
      setEditingGoal(goal);
      contributionForm.reset();
  }

  if (!isClient) {
    return <div>Loading...</div>
  }
  
  if (!user) {
      return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Welcome!</h2>
                    <p className="text-muted-foreground">Please set up your profile first to use the savings planner.</p>
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
                <h1 className="text-3xl md:text-4xl font-bold">Savings Goals</h1>
                <p className="text-muted-foreground">Your history of AI-generated savings plans.</p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
                <PlusCircle className="mr-2" /> Create New Goal
            </Button>
        </div>

        <div className="space-y-4">
            {savingsGoals.length > 0 ? (
                savingsGoals.map(goal => {
                    const progress = goal.amount ? ((goal.currentAmount || 0) / goal.amount) * 100 : 0;
                    return (
                    <Card key={goal.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{goal.name}</CardTitle>
                                    <CardDescription>
                                        Goal: {currencySymbol}{(goal.amount || 0).toLocaleString()} &bull; Created on {format(new Date(goal.createdAt), 'MMM d, yyyy')}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleViewPlan(goal.plan)}>
                                        <Eye className="mr-2 h-4 w-4" /> View Plan
                                    </Button>
                                    <Button variant="destructive" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mb-2 text-sm">
                                <span className="text-muted-foreground">Progress ({progress.toFixed(0)}%)</span>
                                <span className="font-medium">{currencySymbol}{(goal.currentAmount || 0).toLocaleString()} / {currencySymbol}{(goal.amount || 0).toLocaleString()}</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="mt-4">
                                <Button variant="secondary" size="sm" onClick={() => handleOpenContribution(goal)}>
                                    <FilePenLine className="mr-2 h-4 w-4" /> Add Contribution
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )})
            ) : (
                <Card className="text-center py-16 border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center">
                        <PiggyBank className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">No savings goals yet.</h3>
                        <p className="text-muted-foreground mt-1 max-w-sm">
                            Click "Create New Goal" to get your first AI-powered savings plan.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>

        {/* Create Goal Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Savings Goal</DialogTitle>
                    <DialogDescription>
                        Tell me what you're saving for, and I'll generate a plan for you.
                    </DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form
                    onSubmit={form.handleSubmit(handleGeneratePlan)}
                    className="space-y-4 pt-4"
                    >
                    <FormField
                        control={form.control}
                        name="goalName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>What are you saving for?</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., New Laptop" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="goalAmount"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>How much do you need to save?</FormLabel>
                            <FormControl>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
                                {currencySymbol}
                                </span>
                                <Input
                                type="number"
                                placeholder="e.g., 1500"
                                className="pl-8"
                                {...field}
                                value={field.value ?? ""}
                                />
                            </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <Button type="submit" className="w-full" disabled={isGenerating}>
                        {isGenerating ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                        ) : (
                            "Generate My Plan"
                        )}
                        </Button>
                    </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
        
        {/* View Plan Dialog */}
        <Dialog open={isViewPlanDialogOpen} onOpenChange={setViewPlanDialogOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>AI Savings Plan</DialogTitle>
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-y-auto">
                    <div
                    className="text-sm whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: selectedPlan.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^- /gm, '• ').replace(/\n/g, '<br />') }}
                    />
                </div>
            </DialogContent>
        </Dialog>

        {/* Add Contribution Dialog */}
        <Dialog open={!!editingGoal} onOpenChange={(isOpen) => !isOpen && setEditingGoal(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Contribution to "{editingGoal?.name}"</DialogTitle>
                    <DialogDescription>
                        How much have you saved towards this goal?
                    </DialogDescription>
                </DialogHeader>
                <Form {...contributionForm}>
                    <form onSubmit={contributionForm.handleSubmit(handleAddContribution)} className="space-y-4 pt-4">
                        <FormField
                            control={contributionForm.control}
                            name="amount"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contribution Amount</FormLabel>
                                <FormControl>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
                                    {currencySymbol}
                                    </span>
                                    <Input
                                        type="number"
                                        placeholder="e.g., 50"
                                        className="pl-8"
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Add Contribution</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
