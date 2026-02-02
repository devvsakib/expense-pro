
'use client';

import type { UserProfile, Expense } from "@/app/types";
import { useMemo } from "react";
import { getCurrencySymbol } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, ShoppingCart, DollarSign, CalendarDays } from "lucide-react";
import { differenceInDays, startOfDay, startOfWeek, startOfMonth, startOfYear, getDate } from 'date-fns';

interface ReportSummaryProps {
    user: UserProfile;
    expenses: Expense[];
    dateFilter: 'all' | 'week' | 'month' | 'year';
}

export default function ReportSummary({ user, expenses, dateFilter }: ReportSummaryProps) {
    const currencySymbol = getCurrencySymbol(user.currency);

    const summary = useMemo(() => {
        if (expenses.length === 0) {
            return {
                totalSpending: 0,
                transactionCount: 0,
                avgTransaction: 0,
                avgDailySpend: 0,
            };
        }

        const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);
        const transactionCount = expenses.length;
        const avgTransaction = transactionCount > 0 ? totalSpending / transactionCount : 0;
        
        const now = new Date();
        let daysInPeriod = 1;
        switch(dateFilter) {
            case 'week':
                daysInPeriod = differenceInDays(now, startOfWeek(now)) + 1;
                break;
            case 'month':
                daysInPeriod = getDate(now);
                break;
            case 'year':
                daysInPeriod = differenceInDays(now, startOfYear(now)) + 1;
                break;
            case 'all':
                const firstDate = expenses.reduce((earliest, e) => new Date(e.date) < earliest ? new Date(e.date) : earliest, now);
                daysInPeriod = differenceInDays(now, startOfDay(firstDate)) + 1;
                break;
        }
        daysInPeriod = Math.max(daysInPeriod, 1);
        
        const avgDailySpend = totalSpending / daysInPeriod;

        return { totalSpending, transactionCount, avgTransaction, avgDailySpend };

    }, [expenses, dateFilter]);
    
    const formatValue = (value: number) => currencySymbol + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Period Summary</CardTitle>
                <CardDescription>Key metrics for the selected time period.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="text-center p-4">
                        <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold">{formatValue(summary.totalSpending)}</p>
                    </Card>
                    <Card className="text-center p-4">
                        <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">Transactions</p>
                        <p className="text-2xl font-bold">{summary.transactionCount}</p>
                    </Card>
                    <Card className="text-center p-4">
                        <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">Avg. Transaction</p>
                        <p className="text-2xl font-bold">{formatValue(summary.avgTransaction)}</p>
                    </Card>
                    <Card className="text-center p-4">
                        <CalendarDays className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">Avg. Daily Spend</p>
                        <p className="text-2xl font-bold">{formatValue(summary.avgDailySpend)}</p>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
}
