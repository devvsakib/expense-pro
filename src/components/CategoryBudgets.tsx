
'use client';

import type { UserProfile, Expense, CategoryBudget } from "@/app/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCurrencySymbol } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CategoryBudgetsProps {
    user: UserProfile;
    expenses: Expense[];
}

export default function CategoryBudgets({ user, expenses }: CategoryBudgetsProps) {
    const currencySymbol = getCurrencySymbol(user.currency);
    
    const budgetData = useMemo(() => {
        if (!user.categoryBudgets || user.categoryBudgets.length === 0) {
            return [];
        }

        const spendingByCategory: { [key: string]: number } = {};
        expenses.forEach(expense => {
            spendingByCategory[expense.category] = (spendingByCategory[expense.category] || 0) + expense.amount;
        });

        return user.categoryBudgets.map(budget => {
            const spent = spendingByCategory[budget.category] || 0;
            const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
            return {
                ...budget,
                spent,
                progress: Math.min(progress, 100), // Cap progress at 100 for visuals
                overBudget: progress > 100,
            };
        }).sort((a,b) => b.progress - a.progress);

    }, [user.categoryBudgets, expenses]);

    if (!user.categoryBudgets || user.categoryBudgets.length === 0) {
        return (
             <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>Category Budgets</CardTitle>
                    <CardDescription>Track spending against specific category limits.</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                    <p>No category budgets set yet.</p>
                    <Button variant="link" asChild>
                        <Link href="/settings">Go to Settings to add one</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Category Budgets</CardTitle>
                <CardDescription>Your spending progress for budgeted categories.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {budgetData.map(budget => (
                    <div key={budget.category}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium">{budget.category}</span>
                            <span className={`font-mono ${budget.overBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {currencySymbol}{budget.spent.toLocaleString()} / {currencySymbol}{budget.amount.toLocaleString()}
                            </span>
                        </div>
                        <Progress 
                            value={budget.progress} 
                            className={`h-2 ${budget.overBudget ? '[&>div]:bg-destructive' : ''}`}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
