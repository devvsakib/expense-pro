import type { Expense, UserProfile } from "@/app/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hourglass, CalendarClock, Repeat } from "lucide-react";
import { getCurrencySymbol } from "@/lib/utils";
import SalaryCard from "./SalaryCard";

interface ExpenseSummaryProps {
    user: UserProfile;
    expenses: Expense[];
    showSalaryInfo: boolean;
}

export default function ExpenseSummary({
    user,
    expenses,
    showSalaryInfo = true,
}: ExpenseSummaryProps) {
    const { currency } = user;
    const currencySymbol = getCurrencySymbol(currency);

    const pendingExpenses = expenses.filter((e) => e.status === "pending");
    const pendingCount = pendingExpenses.length;
    const pendingTotal = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);

    const upcomingExpenses = expenses.filter((e) => e.status === "upcoming");
    const upcomingCount = upcomingExpenses.length;
    const upcomingTotal = upcomingExpenses.reduce(
        (sum, e) => sum + e.amount,
        0,
    );

    const recurringExpenses = expenses.filter(
        (e) => e.recurrence !== "one-time",
    );
    const recurringMonthlyCost = recurringExpenses.reduce((total, expense) => {
        let monthlyCost = 0;
        switch (expense.recurrence) {
            case "daily":
                monthlyCost = expense.amount * 30; // Approximation
                break;
            case "weekly":
                monthlyCost = expense.amount * 4.33; // More accurate approximation
                break;
            case "monthly":
                monthlyCost = expense.amount;
                break;
            default:
                monthlyCost = 0;
        }
        return total + monthlyCost;
    }, 0);

    return (
        <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending
                        </CardTitle>
                        <Hourglass className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {currencySymbol}
                            {pendingTotal.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {pendingCount} transaction(s)
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Upcoming
                        </CardTitle>
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {currencySymbol}
                            {upcomingTotal.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {upcomingCount} transaction(s)
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Recurring
                        </CardTitle>
                        <Repeat className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {currencySymbol}
                            {recurringMonthlyCost.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            estimated monthly cost
                        </p>
                    </CardContent>
                </Card>
            </div>
            {showSalaryInfo && <SalaryCard user={user} />}
        </div>
    );
}
