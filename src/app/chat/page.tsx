'use client';

import { useState, useEffect } from 'react';
import type { UserProfile, Expense } from '@/app/types';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';

export default function ChatPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedUser = localStorage.getItem("expense-tracker-user");
      if (storedUser) setUser(JSON.parse(storedUser));

      const storedExpenses = localStorage.getItem("expense-tracker-expenses");
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses).map((e: any) => ({ ...e, date: new Date(e.date) })));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Welcome!</h2>
            <p className="text-muted-foreground">Please set up your profile first to use the AI chat.</p>
            <Button asChild className="mt-4">
              <Link href="/">Go to Dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-1 flex flex-col max-w-4xl">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">AI Financial Chat</h1>
            <p className="text-muted-foreground">Ask anything about your spending habits.</p>
        </div>
        <ChatInterface user={user} expenses={expenses} />
      </main>
    </div>
  );
}
