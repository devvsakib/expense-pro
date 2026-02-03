
import { Button } from "@/components/ui/button";
import { Settings, LayoutGrid, Wallet, PiggyBank, Repeat, CalendarDays, MessageCircle, FileText, Menu, User } from "lucide-react";
import { CompassIcon } from "./icons";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

export default function Header() {
  const navLinks = [
    { href: "/", title: "Expense Tracker", icon: Wallet },
    { href: "/planner", title: "Task Planner", icon: LayoutGrid },
    { href: "/savings", title: "Savings Goals", icon: PiggyBank },
    { href: "/subscriptions", title: "Subscriptions", icon: Repeat },
    { href: "/calendar", title: "Calendar", icon: CalendarDays },
    { href: "/chat", title: "AI Chat", icon: MessageCircle },
    { href: "/reports", title: "Reports", icon: FileText },
    { href: "/profile", title: "Profile", icon: User },
    { href: "/settings", title: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center max-w-6xl mx-auto">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <CompassIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">XPNS</h1>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden flex-1 items-center justify-end space-x-2 md:flex">
          {navLinks.map(({ href, title, icon: Icon }) => (
            <Link href={href} key={title} passHref>
              <Button variant="ghost" size="icon" title={title}>
                <Icon className="h-4 w-4" />
                <span className="sr-only">{title}</span>
              </Button>
            </Link>
          ))}
        </div>

        {/* Mobile Nav */}
        <div className="flex flex-1 justify-end md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px]">
              <nav className="flex flex-col gap-4 pt-8">
                {navLinks.map(({ href, title, icon: Icon }) => (
                  <SheetClose asChild key={title}>
                    <Link href={href}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Icon className="h-5 w-5" />
                        {title}
                      </Button>
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
