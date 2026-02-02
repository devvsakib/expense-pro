"use client"

import { useMemo } from "react";
import { PieChart, Pie, Cell } from "recharts";
import type { Expense, CustomCategory } from "@/app/types";
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
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { getCurrencySymbol } from "@/lib/utils";

interface CategoryPieChartProps {
  expenses: Expense[];
  currency: string;
  customCategories: CustomCategory[];
}

export default function CategoryPieChart({ expenses, currency, customCategories }: CategoryPieChartProps) {
  const currencySymbol = getCurrencySymbol(currency);
  const {data: categoryData, config: chartConfig } = useMemo(() => {
    const dataMap: { [key in string]?: number } = {};
    expenses.forEach(expense => {
      dataMap[expense.category] = (dataMap[expense.category] || 0) + expense.amount;
    });

    const data = Object.entries(dataMap)
      .map(([name, value]) => ({ name, value: value! }))
      .sort((a,b) => b.value - a.value);
      
    const config: ChartConfig = {};
    data.forEach((item, index) => {
        const custom = customCategories?.find(c => c.name === item.name);
        config[item.name] = {
            label: (
              <div className="flex items-center gap-1.5">
                {custom?.emoji && <span className="text-sm">{custom.emoji}</span>}
                <span>{item.name}</span>
              </div>
            ),
            color: custom?.color || `hsl(var(--chart-${(index % 5) + 1}))`
        };
    });

    return { data, config };
  }, [expenses, customCategories]);


  if (categoryData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>How your spending is distributed.</CardDescription>
            </CardHeader>
            <CardContent className="flex h-[300px] w-full items-center justify-center">
                <p className="text-muted-foreground">No expenses to display.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>How your spending is distributed.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
            <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                      hideLabel 
                      formatter={(value) => `${currencySymbol}${(value as number).toLocaleString()}`}
                    />}
                />
                <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={2}
                >
                    {categoryData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.name].color} />
                    ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="-mt-2 flex-wrap"
                />
            </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
