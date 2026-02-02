
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserProfile, Currency, CustomCategory, Expense, CategoryBudget, ExpenseStatus, Recurrence } from '@/app/types';
import { currencyOptions, expenseCategories, expenseStatuses, recurrenceOptions } from '@/app/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, PlusCircle, Trash2, Download, Target, Bot, Settings as SettingsIcon } from 'lucide-react';
import Header from '@/components/Header';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { unparse } from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getCurrencySymbol } from '@/lib/utils';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { Switch } from '@/components/ui/switch';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  monthlyBudget: z.coerce.number().positive({ message: "Budget must be a positive number." }),
  currency: z.enum(currencyOptions.map(c => c.value) as [Currency, ...Currency[]]),
  salary: z.coerce.number().positive({ message: "Salary must be a positive number." }).optional().or(z.literal('')),
  salaryPassword: z.string().optional().refine(val => val === '' || val === undefined || val.length >= 4, {
        message: "Password must be at least 4 characters.",
    }),
  useMockAI: z.boolean().optional(),
  defaultStatus: z.enum(expenseStatuses).optional(),
  defaultRecurrence: z.enum(recurrenceOptions).optional(),
}).refine(data => (data.salary && data.salary > 0) ? !!data.salaryPassword : true, {
    message: "A password is required if you set a salary.",
    path: ["salaryPassword"],
});

const categoryFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  emoji: z.string().min(1, { message: "An emoji is required." }),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, { message: "Must be a valid hex color." }),
});

const categoryBudgetFormSchema = z.object({
    category: z.string().min(1, { message: "Please select a category." }),
    amount: z.coerce.number().positive({ message: "Budget must be a positive number." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type CategoryFormValues = z.infer<typeof categoryFormSchema>;
type CategoryBudgetFormValues = z.infer<typeof categoryBudgetFormSchema>;

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isCategoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const { toast } = useToast();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
  });

  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      emoji: '💡',
      color: '#A855F7',
    }
  });

  const budgetForm = useForm<CategoryBudgetFormValues>({
    resolver: zodResolver(categoryBudgetFormSchema),
    defaultValues: {
        category: '',
        amount: undefined,
    }
  });
  
  useEffect(() => {
    setIsClient(true);
    try {
        const storedUser = localStorage.getItem('expense-tracker-user');
        if (storedUser) {
          const parsedUser: UserProfile = JSON.parse(storedUser);
          setUser(parsedUser);
          profileForm.reset({
              ...parsedUser,
              salary: parsedUser.salary || '',
              salaryPassword: parsedUser.salaryPassword || '',
              useMockAI: parsedUser.useMockAI || false,
              defaultStatus: parsedUser.defaultStatus || 'completed',
              defaultRecurrence: parsedUser.defaultRecurrence || 'one-time',
          });
        }
        const storedExpenses = localStorage.getItem('expense-tracker-expenses');
        if (storedExpenses) {
            const parsedExpenses = JSON.parse(storedExpenses).map(
              (expense: any) => ({
                ...expense,
                date: new Date(expense.date),
              })
            );
            setExpenses(parsedExpenses);
        }
    } catch(error) {
        console.error("Failed to load data from localStorage", error);
    }
  }, [profileForm]);

  const updateUserProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem('expense-tracker-user', JSON.stringify(updatedUser));
  };

  function onProfileSubmit(values: ProfileFormValues) {
    const updatedUser = { 
        ...user, 
        ...values,
        salary: values.salary || undefined,
        salaryPassword: values.salaryPassword || undefined
    } as UserProfile;
    updateUserProfile(updatedUser);
    toast({
      title: 'Settings saved!',
      description: 'Your profile has been updated.',
    });
  }

  function onCategorySubmit(values: CategoryFormValues) {
    if (!user) return;
    const newCategory: CustomCategory = {
      id: crypto.randomUUID(),
      ...values,
    };
    const updatedCategories = [...(user.customCategories || []), newCategory];
    updateUserProfile({ ...user, customCategories: updatedCategories });
    toast({
      title: "Category Added",
      description: `"${newCategory.name}" has been added.`,
    });
    categoryForm.reset();
    setCategoryDialogOpen(false);
  }

  const deleteCategory = (id: string) => {
    if (!user) return;
    const updatedCategories = (user.customCategories || []).filter(cat => cat.id !== id);
    updateUserProfile({ ...user, customCategories: updatedCategories });
    toast({
      title: "Category Deleted",
      variant: "destructive"
    });
  };

  function onBudgetSubmit(values: CategoryBudgetFormValues) {
    if (!user) return;
    const newBudget: CategoryBudget = {
        category: values.category,
        amount: values.amount,
    };
    // Avoid duplicate budgets for the same category
    const otherBudgets = (user.categoryBudgets || []).filter(b => b.category !== values.category);
    const updatedBudgets = [...otherBudgets, newBudget];
    updateUserProfile({ ...user, categoryBudgets: updatedBudgets });
    toast({
      title: "Category Budget Set",
      description: `Budget for "${newBudget.category}" has been set.`,
    });
    budgetForm.reset();
    setBudgetDialogOpen(false);
  }

  const deleteCategoryBudget = (categoryName: string) => {
    if (!user) return;
    const updatedBudgets = (user.categoryBudgets || []).filter(b => b.category !== categoryName);
    updateUserProfile({ ...user, categoryBudgets: updatedBudgets });
    toast({
      title: "Category Budget Deleted",
      variant: "destructive"
    });
  };


  const handleResetData = () => {
    localStorage.removeItem('expense-tracker-user');
    localStorage.removeItem('expense-tracker-expenses');
    localStorage.removeItem('expense-tracker-savings-goals');
    localStorage.removeItem('task-planner-tasks');
    toast({
        title: 'Data Reset',
        description: 'All your application data has been cleared.',
    });
    window.location.href = '/';
  }

  const downloadFile = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = (exportFormat: 'csv' | 'txt' | 'pdf') => {
    if (!user || expenses.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: "There is no expense data to export.",
      });
      return;
    }
    
    const date = format(new Date(), 'yyyy-MM-dd');
    const dataToExport = expenses.map(e => ({
        ID: e.id,
        Title: e.title,
        Amount: e.amount,
        Currency: user!.currency,
        Date: format(e.date, "yyyy-MM-dd"),
        Category: e.category,
        Status: e.status,
        Recurrence: e.recurrence,
        Notes: e.notes || "",
    }));

    if (exportFormat === 'csv') {
      const csv = unparse(dataToExport);
      downloadFile(csv, `xpns-export-${date}.csv`, 'text/csv;charset=utf-8;');
    } else if (exportFormat === 'txt') {
      let txtContent = `XPNS Data Export - ${date}\n\n`;
      txtContent += `User: ${user.name}\n`;
      txtContent += `Monthly Budget: ${user.monthlyBudget} ${user.currency}\n`;
      txtContent += `------------------------------------\n\n`;
      txtContent += `Expenses (${expenses.length}):\n\n`;

      dataToExport.forEach(e => {
          txtContent += `Title: ${e.Title}\n`;
          txtContent += `Amount: ${e.Amount} ${e.Currency}\n`;
          txtContent += `Date: ${e.Date}\n`;
          txtContent += `Category: ${e.Category}\n`;
          txtContent += `Status: ${e.Status}\n`;
          txtContent += `Recurrence: ${e.Recurrence}\n`;
          txtContent += `Notes: ${e.Notes}\n`;
          txtContent += `----------------\n`;
      });
      downloadFile(txtContent, `xpns-export-${date}.txt`, 'text/plain;charset=utf-8;');
    } else if (exportFormat === 'pdf') {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("XPNS Data Export", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${date}`, 14, 30);
        doc.text(`User: ${user.name}`, 14, 35);
        doc.text(`Monthly Budget: ${getCurrencySymbol(user.currency)}${user.monthlyBudget.toLocaleString()}`, 14, 40);

        const tableColumn = ["Date", "Title", "Category", "Amount"];
        const tableRows: (string | number)[][] = [];

        dataToExport.forEach(item => {
            const expenseData = [
                item.Date,
                item.Title,
                item.Category,
                `${getCurrencySymbol(item.Currency)}${item.Amount.toFixed(2)}`
            ];
            tableRows.push(expenseData);
        });

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50,
        });
        
        doc.save(`xpns-export-${date}.pdf`);
    }

    toast({
      title: "Download Started",
      description: `Your data export in ${exportFormat.toUpperCase()} format is being downloaded.`,
    });
  }
  
  if (!isClient || !user) {
    return <div>Loading...</div>
  }

  const allCategories = [
    ...expenseCategories,
    ...(user.customCategories || []).map(c => c.name)
  ].sort();
  const currencySymbol = getCurrencySymbol(user.currency);


  return (
    <>
      <Header />
      <main className="container mx-auto py-8 px-4 max-w-2xl">
         <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
        </Link>
        <div className="space-y-8">
            <ThemeSwitcher />
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your profile and application settings.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="monthlyBudget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly Budget</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {currencyOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                    <Separator />
                    <CardTitle className="text-lg">Salary Settings</CardTitle>
                     <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="salary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly Salary (Optional)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g., 100000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="salaryPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Salary Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Min. 4 characters" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                    <Button type="submit">Save Profile</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Default Expense Settings</CardTitle>
                    <CardDescription>Set default values for new expenses to speed up data entry.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={profileForm.control}
                                    name="defaultStatus"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Default Status</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a default status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {expenseStatuses.map((status) => (
                                                        <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={profileForm.control}
                                    name="defaultRecurrence"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Default Recurrence</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a default recurrence" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {recurrenceOptions.map((option) => (
                                                        <SelectItem key={option} value={option} className="capitalize">{option.replace('-', ' ')}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Save Defaults</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle>Category Budgets</CardTitle>
                <CardDescription>Set spending limits for specific categories.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {(user.categoryBudgets || []).map(budget => (
                    <div key={budget.category} className="flex items-center justify-between p-2 rounded-md border">
                        <div className="flex items-center gap-3">
                           <Target className="w-4 h-4 text-muted-foreground"/>
                           <span className="font-medium">{budget.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-sm text-muted-foreground">
                                {currencySymbol}{budget.amount.toLocaleString()} / month
                            </span>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete the budget for the category "{budget.category}".
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteCategoryBudget(budget.category)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                  ))}
                  {(user.categoryBudgets?.length || 0) === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No category budgets set yet.</p>
                  )}
                </div>
                <Dialog open={isBudgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <PlusCircle className="mr-2" /> Add Budget
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add a New Category Budget</DialogTitle>
                    </DialogHeader>
                    <Form {...budgetForm}>
                      <form onSubmit={budgetForm.handleSubmit(onBudgetSubmit)} className="space-y-4">
                         <FormField
                          control={budgetForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {allCategories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={budgetForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budget Amount</FormLabel>
                              <FormControl>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
                                    {currencySymbol}
                                    </span>
                                    <Input
                                    type="number"
                                    placeholder="e.g., 500"
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
                          <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                          <Button type="submit">Set Budget</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Categories</CardTitle>
                <CardDescription>Create and manage your own spending categories.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {(user.customCategories || []).map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-2 rounded-md border">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{cat.emoji}</span>
                          <span style={{
                              '--color': cat.color,
                              'backgroundColor': `${cat.color}20`,
                              'color': cat.color,
                            } as React.CSSProperties} className="font-semibold text-[var(--color)] bg-[var(--bg)] px-2 py-0.5 rounded-full text-sm">
                            {cat.name}
                          </span>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the category "{cat.name}". This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteCategory(cat.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  ))}
                  {(user.customCategories?.length || 0) === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No custom categories yet.</p>
                  )}
                </div>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <PlusCircle className="mr-2" /> Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add a New Category</DialogTitle>
                    </DialogHeader>
                    <Form {...categoryForm}>
                      <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                        <FormField
                          control={categoryForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category Name</FormLabel>
                              <FormControl><Input placeholder="e.g., Subscriptions" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={categoryForm.control}
                          name="emoji"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emoji</FormLabel>
                              <FormControl><Input placeholder="e.g., 💖" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={categoryForm.control}
                          name="color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Color</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input placeholder="#A855F7" {...field} className="pl-12"/>
                                  <Input type="color" className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-1 bg-transparent border-none" value={field.value} onChange={field.onChange} />
                                </div>
                              </FormControl>
                              <FormDescription>Choose a color for your category.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                          <Button type="submit">Add Category</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Export</CardTitle>
                <CardDescription>Download all your expense data in various formats.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleExport('csv')}>
                    <Download className="mr-2"/> Export as CSV
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleExport('txt')}>
                    <Download className="mr-2"/> Export as TXT
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleExport('pdf')}>
                    <Download className="mr-2"/> Export as PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle>Developer Settings</CardTitle>
                  <CardDescription>Control AI features and other development options.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                           <FormField
                              control={profileForm.control}
                              name="useMockAI"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base flex items-center gap-2">
                                        <Bot /> Use Mock AI for Receipt Scanning
                                    </FormLabel>
                                    <FormDescription>
                                      Enable this to use simulated AI responses instead of real ones.
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={(checked) => {
                                          field.onChange(checked);
                                          // Immediately submit the form on change
                                          profileForm.handleSubmit(onProfileSubmit)();
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                      </form>
                  </Form>
              </CardContent>
            </Card>

            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle/> Danger Zone</CardTitle>
                    <CardDescription>These actions are irreversible. Please be certain.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Reset All Data</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete all your
                                application data from this device.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetData}>
                                Yes, reset my data
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}
