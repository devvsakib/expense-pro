"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Loader2, PiggyBank } from "lucide-react";
import type { UserProfile, Expense } from "@/app/types";
import { format } from "date-fns";
import { generateSavingsPlan } from "@/ai/flows/ai-savings-coach";
import { getCurrencySymbol } from "@/lib/utils";

interface SavingsCoachDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: UserProfile;
  expenses: Expense[];
}

const formSchema = z.object({
  goalName: z.string().min(3, "Please enter a name for your goal."),
  goalAmount: z.coerce.number().positive("Please enter a positive amount."),
});

type FormValues = z.infer<typeof formSchema>;

export default function SavingsCoachDialog({
  isOpen,
  onOpenChange,
  user,
  expenses,
}: SavingsCoachDialogProps) {
  const [aiPlan, setAiPlan] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const currencySymbol = getCurrencySymbol(user.currency);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goalName: "",
      goalAmount: undefined,
    },
  });

  const handleGeneratePlan = async (values: FormValues) => {
    setIsGenerating(true);
    setAiPlan("");

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
      setAiPlan(result.plan);
    } catch (error) {
      console.error("Failed to generate savings plan", error);
      setAiPlan(
        "Sorry, I couldn't generate a plan at this time. Please try again later."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const resetDialog = () => {
    form.reset({ goalName: "", goalAmount: undefined });
    setAiPlan("");
    setIsGenerating(false);
  };
  
  const handleOpenChangeWithReset = (open: boolean) => {
    if(!open) {
        resetDialog();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChangeWithReset}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiggyBank className="text-primary h-5 w-5" />
            AI Savings Coach
          </DialogTitle>
          <DialogDescription>
            Tell me your savings goal, and I'll create a personalized plan based
            on your spending.
          </DialogDescription>
        </DialogHeader>

        {isGenerating ? (
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-center flex-col gap-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Crafting your savings plan...
              </p>
            </div>
          </div>
        ) : aiPlan ? (
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            <div
              className="text-sm whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: aiPlan.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }}
            />
            <Button variant="outline" className="mt-4 w-full" onClick={resetDialog}>Create a New Plan</Button>
          </div>
        ) : (
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
                      <Input placeholder="e.g., Summer Vacation" {...field} />
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
                <Button type="submit" className="w-full" disabled={isGenerating}>
                  Generate My Plan
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
