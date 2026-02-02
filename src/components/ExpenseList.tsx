import type { Expense } from "@/app/types";
import ExpenseItem from "./ExpenseItem";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
  currency: string;
}

export default function ExpenseList({ expenses, onDelete, onEdit, currency }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <Card className="text-center py-16 border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center">
          <BarChart2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">No expenses found.</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            Try adjusting your search or filter, or add a new expense to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedExpenses = [...expenses].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  return (
    <div className="space-y-4">
      {sortedExpenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onDelete={onDelete}
          onEdit={onEdit}
          currency={currency}
        />
      ))}
    </div>
  );
}
