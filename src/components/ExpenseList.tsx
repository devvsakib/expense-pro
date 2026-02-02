import type { Expense } from "@/app/types";
import ExpenseItem from "./ExpenseItem";
import { Card, CardContent } from "@/components/ui/card";

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export default function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <Card className="text-center py-12 border-dashed">
        <CardContent>
          <h3 className="text-lg font-medium">No expenses yet!</h3>
          <p className="text-muted-foreground mt-1">
            Add a new expense above to get started.
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
        <ExpenseItem key={expense.id} expense={expense} onDelete={onDelete} />
      ))}
    </div>
  );
}