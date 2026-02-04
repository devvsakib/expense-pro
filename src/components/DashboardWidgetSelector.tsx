'use client';

import type { UserProfile, WidgetKey } from '@/app/types';
import { SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DashboardWidgetSelectorProps {
  user: UserProfile;
  onWidgetToggle: (widget: WidgetKey, enabled: boolean) => void;
}

const widgetConfig: { id: WidgetKey; label: string; description: string }[] = [
  { id: 'budgetProgress', label: 'Budget Progress', description: 'Your overall monthly budget tracking.' },
  { id: 'pendingSummary', label: 'Pending Summary', description: 'Summary of expenses marked as pending.' },
  { id: 'upcomingSummary', label: 'Upcoming Summary', description: 'Summary of expenses marked as upcoming.' },
  { id: 'recurringSummary', label: 'Recurring Summary', description: 'Estimated monthly cost of recurring expenses.' },
  { id: 'categoryBudgets', label: 'Category Budgets', description: 'Track spending against specific category limits.' },
  { id: 'spendingChart', label: '7-Day Spending Trend', description: 'A bar chart of your spending over the last week.' },
  { id: 'categoryPieChart', label: 'Category Breakdown', description: 'A pie chart of your spending distribution.' },
];

export default function DashboardWidgetSelector({ user, onWidgetToggle }: DashboardWidgetSelectorProps) {
  const currentWidgets = user.dashboardWidgets || {};

  return (
    <>
      <SheetHeader>
        <SheetTitle>Customize Dashboard</SheetTitle>
        <SheetDescription>
          Select the widgets you want to see on your dashboard.
        </SheetDescription>
      </SheetHeader>
      <ScrollArea className="flex-1 -mx-6 px-6 mt-4">
        <div className="space-y-6 py-4">
          {widgetConfig.map((widget) => (
            <div
              key={widget.id}
              className="flex items-center justify-between"
            >
              <div className="space-y-1">
                <Label htmlFor={`widget-${widget.id}`} className="font-semibold text-base">
                  {widget.label}
                </Label>
                <p className="text-sm text-muted-foreground">{widget.description}</p>
              </div>
              <Switch
                id={`widget-${widget.id}`}
                checked={!!currentWidgets[widget.id]}
                onCheckedChange={(checked) => onWidgetToggle(widget.id, checked)}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </>
  );
}
