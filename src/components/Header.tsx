import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Settings, BarChart } from "lucide-react";
import { CompassIcon } from "./icons";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center max-w-6xl mx-auto">
        <div className="mr-4 flex items-center">
          <CompassIcon className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">XPNS</h1>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="icon" disabled>
            <BarChart className="h-4 w-4" />
            <span className="sr-only">Reports</span>
          </Button>
          <Button variant="ghost" size="icon" disabled>
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
