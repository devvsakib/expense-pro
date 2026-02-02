import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Calendar, BarChart } from "lucide-react";
import { CompassIcon } from "./icons";
import type { DailySummaryProps } from "./DailySummary";
import DailySummary from "./DailySummary";

interface HeaderProps {
  tasks: DailySummaryProps['tasks'];
}

export default function Header({ tasks }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <CompassIcon className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Day Compass</h1>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="sm" disabled>
            <Calendar className="mr-2 h-4 w-4" />
            Sync Calendar
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <BarChart className="mr-2 h-4 w-4" />
                Daily Summary
              </Button>
            </SheetTrigger>
            <SheetContent>
              <DailySummary tasks={tasks} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
