import type { Expense, UserProfile } from "@/app/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hourglass, CalendarClock, Repeat } from "lucide-react";
import { getCurrencySymbol } from "@/lib/utils";

interface ExpenseSummaryProps {
    user: UserProfile;
    expenses: Expense[];
    type: 'pending' | 'upcoming' | 'recurring';
}

const summaryConfig = {
    pending: {
        title: "Pending",
        icon: Hourglass,
    },
    upcoming: {
        title: "Upcoming",
        icon: CalendarClock,
    },
    recurring: {
        title: "Recurring",
        icon: Repeat,
    }
}

export default function ExpenseSummary({ user, expenses, type }: ExpenseSummaryProps) {
    const { currency } = user;
    const currencySymbol = getCurrencySymbol(currency);
    const config = summaryConfig[type];
    const Icon = config.icon;
    
    let total = 0;
    let count = 0;
    let description = '';

    if (type === 'pending' || type === 'upcoming') {
        const filteredExpenses = expenses.filter((e) => e.status === type);
        count = filteredExpenses.length;
        total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
        description = `${count} transaction(s)`;
    } else if (type === 'recurring') {
        const recurringExpenses = expenses.filter((e) => e.recurrence !== "one-time");
        total = recurringExpenses.reduce((total, expense) => {
            let monthlyCost = 0;
            switch (expense.recurrence) {
                case "daily":
                    monthlyCost = expense.amount * 30;
                    break;
                case "weekly":
                    monthlyCost = expense.amount * 4.33;
                    break;
                case "monthly":
                    monthlyCost = expense.amount;
                    break;
                default:
                    monthlyCost = 0;
            }
            return total + monthlyCost;
        }, 0);
        description = "estimated monthly cost";
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {config.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {currencySymbol}
                    {total.toLocaleString(undefined, {
                        minimumFractionDigits: type === 'recurring' ? 2 : 0,
                        maximumFractionDigits: 2,
                    })}
                </div>
                <p className="text-xs text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
