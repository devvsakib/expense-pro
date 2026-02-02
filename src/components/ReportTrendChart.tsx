
"use client"

import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  format,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
  isWithinInterval,
} from "date-fns";
import type { Expense } from "@/app/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { getCurrencySymbol } from "@/lib/utils";

interface ReportTrendChartProps {
  expenses: Expense[];
  currency: string;
  dateFilter: 'all' | 'week' | 'month' | 'year';
}

export default function ReportTrendChart({ expenses, currency, dateFilter }: ReportTrendChartProps) {
    const currencySymbol = getCurrencySymbol(currency);

    const { data: chartData, timeUnit } = useMemo(() => {
        const now = new Date();
        let data: { date: string; total: number }[] = [];
        let timeUnit = 'day';

        const getSpendingForInterval = (interval: Interval) => {
            return expenses
                .filter(e => isWithinInterval(new Date(e.date), interval))
                .reduce((sum, e) => sum + e.amount, 0);
        };

        switch (dateFilter) {
            case 'week': {
                timeUnit = 'day';
                const interval = { start: startOfWeek(now), end: endOfWeek(now) };
                data = eachDayOfInterval(interval).map(day => ({
                    date: format(day, 'eee'),
                    total: getSpendingForInterval({ start: startOfDay(day), end: endOfDay(day) }),
                }));
                break;
            }
            case 'month': {
                timeUnit = 'day';
                const interval = { start: startOfMonth(now), end: endOfMonth(now) };
                data = eachDayOfInterval(interval).map(day => ({
                    date: format(day, 'd'),
                    total: getSpendingForInterval({ start: startOfDay(day), end: endOfDay(day) }),
                }));
                break;
            }
            case 'year': {
                timeUnit = 'month';
                const interval = { start: startOfYear(now), end: endOfYear(now) };
                data = eachMonthOfInterval(interval).map(month => ({
                    date: format(month, 'MMM'),
                    total: getSpendingForInterval({ start: startOfMonth(month), end: endOfMonth(month) }),
                }));
                break;
            }
            case 'all': {
                timeUnit = 'month';
                if (expenses.length === 0) {
                    data = [];
                    break;
                }
                const firstDate = expenses.reduce((earliest, e) => new Date(e.date) < earliest ? new Date(e.date) : earliest, new Date());
                
                const monthlyData: {[key: string]: number} = {};
                for (const expense of expenses) {
                    const monthKey = format(new Date(expense.date), 'yyyy-MM');
                    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + expense.amount;
                }
                
                data = eachMonthOfInterval({start: startOfMonth(firstDate), end: endOfMonth(now)}).map(month => ({
                    date: format(month, 'MMM yy'),
                    total: monthlyData[format(month, 'yyyy-MM')] || 0,
                }));
                break;
            }
        }
        return { data, timeUnit };
    }, [expenses, dateFilter]);
    
    const chartConfig = {
        total: {
          label: "Spending",
          color: "hsl(var(--primary))",
        },
    } satisfies ChartConfig;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Spending Trend</CardTitle>
                <CardDescription>Your spending over the selected period.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    {chartData.length > 0 ? (
                        <BarChart accessibilityLayer data={chartData} margin={{ top: 20, left: -12, right: 16, bottom: 0 }}>
                            <XAxis
                              dataKey="date"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              fontSize={12}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              fontSize={12}
                              tickFormatter={(value) => `${currencySymbol}${value}`}
                              domain={[0, 'dataMax + 20']}
                            />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent 
                                indicator="dot" 
                                hideLabel
                                formatter={(value) => `${currencySymbol}${(value as number).toLocaleString()}`}
                              />}
                            />
                            <Bar dataKey="total" fill="var(--color-total)" radius={timeUnit === 'day' ? 4 : 8} />
                        </BarChart>
                    ) : (
                         <div className="flex h-full w-full items-center justify-center">
                            <p className="text-muted-foreground">Not enough data to display trend.</p>
                        </div>
                    )}
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
