"use client";

import type { Expense } from "@/app/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Calendar, Tag } from "lucide-react";

interface ExpenseItemProps {
  expense: Expense;
  onDelete: (id: string) => void;
}

export default function ExpenseItem({ expense, onDelete }: ExpenseItemProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="grid gap-1.5 flex-1">
          <p className="font-medium">{expense.description}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(expense.date, "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              <Badge variant="outline">{expense.category}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="font-bold text-lg">${expense.amount.toFixed(2)}</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(expense.id)}
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete expense</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}