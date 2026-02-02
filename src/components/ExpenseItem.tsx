"use client";

import type { Expense, ExpenseCategory, CustomCategory } from "@/app/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trash2,
  Calendar,
  Tag,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Clapperboard,
  HeartPulse,
  GraduationCap,
  Gift,
  Landmark,
  MoreVertical,
  Edit,
  Circle,
  CheckCircle2,
  Clock,
  Repeat
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getCurrencySymbol, getTextColorForBackground } from "@/lib/utils";
import React from "react";

const categoryIcons: Record<ExpenseCategory, React.ElementType> = {
  Food: Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Entertainment: Clapperboard,
  Health: HeartPulse,
  Education: GraduationCap,
  Gifts: Gift,
  Other: Landmark,
};

const statusVariantMap = {
  completed: "default",
  pending: "secondary",
  upcoming: "outline",
} as const;

const statusIconMap = {
  completed: CheckCircle2,
  pending: Clock,
  upcoming: Calendar,
}

interface ExpenseItemProps {
  expense: Expense;
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
  currency: string;
  customCategories?: CustomCategory[];
}

export default function ExpenseItem({ expense, onDelete, onEdit, currency, customCategories }: ExpenseItemProps) {
  const Icon = categoryIcons[expense.category as ExpenseCategory] || Circle;
  const StatusIcon = statusIconMap[expense.status] || Circle;
  const currencySymbol = getCurrencySymbol(currency);
  
  const customCategory = customCategories?.find(c => c.name === expense.category);

  return (
    <Card className="transition-all hover:shadow-lg animate-in fade-in-0 zoom-in-95">
      <CardContent className="p-4 flex items-start gap-4">
        <div className="flex-shrink-0 h-10 w-10 bg-muted rounded-full flex items-center justify-center mt-1">
          {customCategory ? (
            <span className="text-xl">{customCategory.emoji}</span>
          ) : (
            <Icon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="grid gap-1.5 flex-1">
          <div className="flex justify-between items-start">
            <p className="font-semibold text-lg">{expense.title}</p>
            <p className="font-bold text-lg">{currencySymbol}{expense.amount.toFixed(2)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(expense.date, "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              <Badge 
                variant="outline"
                style={customCategory ? { 
                  backgroundColor: customCategory.color, 
                  color: getTextColorForBackground(customCategory.color),
                  borderColor: customCategory.color 
                } : {}}
              >
                {expense.category}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Repeat className="h-3.5 w-3.5" />
              <span className="capitalize">{expense.recurrence.replace("-", " ")}</span>
            </div>
          </div>
           <div className="flex items-center gap-1.5 mt-1">
              <StatusIcon className={cn("h-4 w-4", {
                  "text-green-500": expense.status === 'completed',
                  "text-yellow-500": expense.status === 'pending',
                  "text-blue-500": expense.status === 'upcoming',
              })} />
              <Badge variant={statusVariantMap[expense.status]} className="capitalize">
                  {expense.status}
              </Badge>
            </div>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(expense)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(expense.id)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
