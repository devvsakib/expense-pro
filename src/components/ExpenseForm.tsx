
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, startOfMonth } from "date-fns";
import { Calendar as CalendarIcon, Camera, Loader2, Sparkles } from "lucide-react";
import { createWorker } from 'tesseract.js';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { cn, getCurrencySymbol } from "@/lib/utils";
import {
  expenseCategories,
  expenseStatuses,
  recurrenceOptions,
  type Expense,
  type UserProfile,
} from "@/app/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { scanReceipt } from "@/ai/flows/ai-receipt-scanner";
import { useToast } from "@/hooks/use-toast";
import { suggestCategory } from "@/ai/flows/ai-categorize-expense";
import { Progress } from "./ui/progress";


const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  date: z.date({
    required_error: "An expense date is required.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }).min(1, { message: "Please select a category." }),
  status: z.enum(expenseStatuses, {
    required_error: "Please select a status.",
  }),
  recurrence: z.enum(recurrenceOptions, {
    required_error: "Please select a recurrence.",
  }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
  expense: Expense | null;
  user: UserProfile;
  expenses: Expense[];
}

export default function ExpenseForm({
  isOpen,
  onClose,
  onSubmit,
  expense,
  user,
  expenses,
}: ExpenseFormProps) {
  const currencySymbol = getCurrencySymbol(user.currency);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ progress: number; status: string } | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [aiSuggestedCategory, setAiSuggestedCategory] = useState<string | null>(null);
  const [aiCategoryError, setAiCategoryError] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (expense) {
        form.reset({
          ...expense,
          amount: expense.amount || undefined,
          notes: expense.notes || "",
          category: expense.category || "",
        });
      } else {
        form.reset({
          title: "",
          amount: undefined,
          date: new Date(),
          category: "",
          status: user.defaultStatus || "completed",
          recurrence: user.defaultRecurrence || "one-time",
          notes: "",
        });
      }
      setAiSuggestedCategory(null);
      setAiCategoryError(null);
    }
  }, [expense, form, isOpen, user]);

  const titleValue = form.watch("title");
  const categoryValue = form.watch("category");
  const { dirtyFields } = form.formState;

  // Debounced effect for AI categorization
  useEffect(() => {
    if (!titleValue) {
        setAiSuggestedCategory(null);
    }

    if (dirtyFields.category) {
        return;
    }

    const handler = setTimeout(async () => {
        if (titleValue && titleValue.length > 3) {
            if (!user.apiKey) {
                setAiCategoryError("An API key is required for AI suggestions.");
                return;
            }
            setIsCategorizing(true);
            setAiSuggestedCategory(null);
            setAiCategoryError(null);
            const allCategories = [
                ...expenseCategories,
                ...(user.customCategories?.map(c => c.name) || [])
            ];

            try {
                const result = await suggestCategory({ title: titleValue, categories: allCategories });
                if (allCategories.includes(result.category) && !form.formState.dirtyFields.category) {
                    form.setValue('category', result.category);
                    setAiSuggestedCategory(result.category);
                }
            } catch (error: any) {
                console.error("Failed to suggest category", error);
                const errorMessage = "AI suggestion failed. Check your API key or try again.";
                setAiCategoryError(errorMessage);
            } finally {
                setIsCategorizing(false);
            }
        }
    }, 800);

    return () => {
        clearTimeout(handler);
    };
  }, [titleValue, dirtyFields.category, form, user.customCategories, user.apiKey]);
  
  useEffect(() => {
    if (dirtyFields.category && categoryValue !== aiSuggestedCategory) {
        setAiSuggestedCategory(null);
    }
  }, [categoryValue, dirtyFields.category, aiSuggestedCategory]);

  const budgetInfo = useMemo(() => {
    if (!categoryValue || !user.categoryBudgets || !expenses) {
        return null;
    }

    const budget = user.categoryBudgets.find(b => b.category === categoryValue);
    if (!budget) {
        return null;
    }

    const now = new Date();
    const monthStart = startOfMonth(now);

    const spentThisMonth = expenses
        .filter(e => 
            e.category === categoryValue && 
            new Date(e.date) >= monthStart && 
            new Date(e.date) <= now
        )
        .reduce((sum, e) => {
            // If we are editing, don't include the current expense's amount in the 'spent' total
            if (expense && e.id === expense.id) {
                return sum;
            }
            return sum + e.amount;
        }, 0);
    
    const remaining = budget.amount - spentThisMonth;
    const progress = budget.amount > 0 ? (spentThisMonth / budget.amount) * 100 : 0;

    return { ...budget, spent: spentThisMonth, remaining, progress };
  }, [categoryValue, user.categoryBudgets, expenses, expense]);


  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };
  
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleReceiptScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user.useMockAI && !user.apiKey) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "AI receipt scanning requires an API key. Please add one in Settings or enable Mock AI.",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsScanning(true);
    setScanProgress(null);
    const allCategories = [
        ...expenseCategories,
        ...(user.customCategories?.map(c => c.name) || [])
    ];

    const populateFormWithResult = (result: any) => {
        form.setValue('title', result.title);
        form.setValue('amount', result.amount);
        form.setValue('date', new Date(`${result.date}T00:00:00`));
        if (allCategories.includes(result.category)) {
            form.setValue('category', result.category, { shouldDirty: true });
            setAiSuggestedCategory(result.category);
        }
        form.setValue('notes', result.notes || '');
        toast({
            title: "Receipt Scanned!",
            description: "Your form has been pre-filled."
        });
    };
    
    const handleError = (error: any) => {
        console.error("Failed to scan receipt", error);
        toast({
            variant: "destructive",
            title: "Scan Failed",
            description: "The AI request failed. Please check if your API key is correct in Settings, or try again later.",
        });
    };

    const cleanup = () => {
        setIsScanning(false);
        setScanProgress(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    if (user.ocrEngine === 'tesseract-ai' && !user.useMockAI) {
        try {
            const worker = await createWorker({
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setScanProgress({ progress: Math.round(m.progress * 100), status: m.status });
                    } else {
                        setScanProgress({ progress: 0, status: m.status });
                    }
                }
            });
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            const { data: { text } } = await worker.recognize(file);
            await worker.terminate();
    
            setScanProgress({ progress: 100, status: 'Analyzing text...' });
            
            const result = await scanReceipt({ rawText: text, categories: allCategories });
            populateFormWithResult(result);
        } catch (error) {
            handleError(error);
        } finally {
            cleanup();
        }
    } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const dataUri = reader.result as string;
            setScanProgress({ progress: 50, status: 'Sending to AI...' });
            try {
                const result = await scanReceipt({ 
                    photoDataUri: dataUri, 
                    categories: allCategories,
                    useMockAI: user.useMockAI || false
                });
                populateFormWithResult(result);
            } catch (error) {
                handleError(error);
            } finally {
                cleanup();
            }
        };
        reader.onerror = (error) => {
            handleError(error);
            cleanup();
        }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[90dvh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>{expense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
          <DialogDescription>
            Fill in the details of your expense. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 space-y-4">
            <div className="p-4 bg-secondary/50 rounded-lg border border-dashed">
                <h3 className="text-sm font-medium mb-2">Have a receipt?</h3>
                <p className="text-xs text-muted-foreground mb-3">
                    Upload an image of your receipt and let AI fill in the details for you.
                </p>
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleReceiptScan}
                    disabled={isScanning}
                />
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isScanning}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {isScanning ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        {scanProgress ? `${scanProgress.status}` : 'Scanning...'}</>
                    ) : (
                        <><Camera className="mr-2 h-4 w-4" /> Scan Receipt</>
                    )}
                </Button>
                {isScanning && scanProgress && scanProgress.progress > 0 && (
                    <Progress value={scanProgress.progress} className="w-full h-1 mt-2" />
                )}
            </div>


            <Form {...form}>
            <form id="expense-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Lunch with colleagues" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
                            {currencySymbol}
                            </span>
                            <Input type="number" placeholder="0.00" className="pl-8" {...field} value={field.value ?? ""} />
                        </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Date of Expense</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                {field.value ? (
                                format(field.value, "PPP")
                                ) : (
                                <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            />
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FormLabel>Category</FormLabel>
                                    {isCategorizing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                </div>
                                {aiSuggestedCategory === field.value && !isCategorizing && (
                                    <div className="flex items-center gap-1 text-xs text-primary animate-in fade-in-0">
                                        <Sparkles className="h-3 w-3" />
                                        <span>AI Suggested</span>
                                    </div>
                                )}
                            </div>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Default Categories</SelectLabel>
                                {expenseCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                                ))}
                            </SelectGroup>
                            {user.customCategories && user.customCategories.length > 0 && (
                                <SelectGroup>
                                <SelectLabel>Custom Categories</SelectLabel>
                                {user.customCategories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.name}>
                                    <div className="flex items-center gap-2">
                                        <span>{cat.emoji}</span>
                                        <span>{cat.name}</span>
                                    </div>
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            )}
                            </SelectContent>
                        </Select>
                        {aiCategoryError && <p className="text-xs text-destructive pt-1">{aiCategoryError}</p>}
                        <FormMessage />
                        {budgetInfo && (
                                <div className="mt-2 text-xs p-3 rounded-md bg-secondary border">
                                    <div className="flex justify-between mb-1 font-medium">
                                        <span>Monthly Budget</span>
                                        <span>{currencySymbol}{budgetInfo.spent.toLocaleString()} / {currencySymbol}{budgetInfo.amount.toLocaleString()}</span>
                                    </div>
                                    <Progress value={budgetInfo.progress} className="h-1.5" />
                                    <p className={`text-right mt-1 font-medium ${budgetInfo.remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                        {currencySymbol}{budgetInfo.remaining.toLocaleString()} remaining
                                    </p>
                                </div>
                            )}
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {expenseStatuses.map((status) => (
                                <SelectItem key={status} value={status} className="capitalize">
                                {status}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="recurrence"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Recurrence</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select recurrence" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {recurrenceOptions.map((option) => (
                                <SelectItem key={option} value={option} className="capitalize">
                                {option.replace("-", " ")}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Add any extra details about the expense..."
                        className="resize-none"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </form>
            </Form>
        </div>
        
        <DialogFooter className="p-6 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="expense-form">
            {expense ? "Save Changes" : "Add Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
