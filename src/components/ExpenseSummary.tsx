import type { Expense } from "@/app/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ExpenseSummaryProps {
  expenses: Expense[];
}

export default function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
      </CardContent>
    </Card>
  );
}