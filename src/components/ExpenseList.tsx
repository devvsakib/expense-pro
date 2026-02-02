import type { Expense, UserProfile } from "@/app/types";
import ExpenseItem from "./ExpenseItem";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";
import { isToday, isYesterday, isAfter, subDays, startOfMonth, format } from 'date-fns';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
  user: UserProfile;
}

export default function ExpenseList({ expenses, onDelete, onEdit, user }: ExpenseListProps) {
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

  const groupExpenses = (expenses: Expense[]) => {
    const now = new Date();
    
    // Using an array to maintain order of groups
    const groups: {title: string, expenses: Expense[]}[] = [];
    const groupMap: {[key: string]: Expense[]} = {};

    const findOrCreateGroup = (title: string) => {
        if (!groupMap[title]) {
            groupMap[title] = [];
            groups.push({ title, expenses: groupMap[title] });
        }
        return groupMap[title];
    };

    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sortedExpenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        let groupTitle: string;

        if (isToday(expenseDate)) {
            groupTitle = 'Today';
        } else if (isYesterday(expenseDate)) {
            groupTitle = 'Yesterday';
        } else if (isAfter(expenseDate, subDays(now, 7))) {
            groupTitle = 'Previous 7 Days';
        } else if (isAfter(expenseDate, startOfMonth(now))) {
            groupTitle = 'This Month';
        } else {
            groupTitle = format(expenseDate, 'MMMM yyyy');
        }
        
        const group = findOrCreateGroup(groupTitle);
        group.push(expense);
    });
      
    return groups;
  };

  const groupedExpenses = groupExpenses(expenses);

  return (
    <div className="space-y-6">
      {groupedExpenses.map(group => (
        <div key={group.title}>
            <h3 className="text-base font-semibold mb-2 text-muted-foreground sticky top-0 bg-background/95 py-2 backdrop-blur-sm">{group.title}</h3>
            <div className="space-y-4">
                {group.expenses.map((expense) => (
                    <ExpenseItem
                    key={expense.id}
                    expense={expense}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    currency={user.currency}
                    customCategories={user.customCategories}
                    />
                ))}
            </div>
        </div>
      ))}
    </div>
  );
}
