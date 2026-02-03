'use client';

import type { Expense, UserProfile } from "@/app/types";
import { useMemo } from "react";
import { getCurrencySymbol } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TopCategoriesProps {
    user: UserProfile;
    expenses: Expense[];
}

export default function TopCategories({ user, expenses }: TopCategoriesProps) {
    const currencySymbol = getCurrencySymbol(user.currency);

    const { categorySpending, totalSpending } = useMemo(() => {
        const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);
        const spendingByCategory: { [key: string]: number } = {};

        expenses.forEach(expense => {
            spendingByCategory[expense.category] = (spendingByCategory[expense.category] || 0) + expense.amount;
        });

        const categorySpendingData = Object.entries(spendingByCategory)
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
            }))
            .sort((a, b) => b.amount - a.amount);
            
        return { categorySpending: categorySpendingData, totalSpending };

    }, [expenses]);

    if (categorySpending.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Spending Categories</CardTitle>
                <CardDescription>A detailed breakdown of your spending by category.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {categorySpending.map(item => (
                    <div key={item.category}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium">{item.category}</span>
                            <span className="font-mono text-muted-foreground">
                                {currencySymbol}{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
