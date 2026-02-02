"use client"

import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { subDays, format, startOfDay } from "date-fns";
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

interface SpendingChartProps {
  expenses: Expense[];
  currency: string;
}

export default function SpendingChart({ expenses, currency }: SpendingChartProps) {
  const currencySymbol = getCurrencySymbol(currency);
  const spendingData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(startOfDay(new Date()), i)).reverse();

    const dailySpending = last7Days.map(day => {
      const total = expenses
        .filter(expense => startOfDay(new Date(expense.date)).getTime() === day.getTime())
        .reduce((acc, expense) => acc + expense.amount, 0);
      return {
        date: format(day, "eee"), // Short day name like "Mon"
        total,
      };
    });
    
    return dailySpending;
  }, [expenses]);
  
  const chartConfig = {
    total: {
      label: "Spending",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>7-Day Spending Trend</CardTitle>
        <CardDescription>Your spending over the last week.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={spendingData} margin={{ top: 20, left: -24, right: 16, bottom: 0 }}>
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
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            <Bar dataKey="total" fill="var(--color-total)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
