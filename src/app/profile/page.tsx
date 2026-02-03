
'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/app/types';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft, User as UserIcon, Wallet, Tag, Target, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrencySymbol } from '@/lib/utils';
import SalaryCard from '@/components/SalaryCard';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';


export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedUser = localStorage.getItem("expense-tracker-user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
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
            <p className="text-muted-foreground">Please set up your profile first to view this page.</p>
            <Button asChild className="mt-4">
              <Link href="/">Go to Dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  const currencySymbol = getCurrencySymbol(user.currency);
  const allCategories = [
    ...user.customCategories || [],
  ];
  const allBudgets = user.categoryBudgets || [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4 max-w-2xl">
         <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
        </Link>
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3"><UserIcon className="h-8 w-8" /> Your Profile</h1>
                <p className="text-muted-foreground">An overview of your personal and financial settings.</p>
            </div>
            <Button asChild variant="outline">
                <Link href="/settings">
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Link>
            </Button>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Wallet /> Financial Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-md bg-secondary">
                        <span className="text-sm font-medium text-muted-foreground">Name</span>
                        <span className="font-semibold">{user.name}</span>
                    </div>
                     <div className="flex justify-between items-center p-3 rounded-md bg-secondary">
                        <span className="text-sm font-medium text-muted-foreground">Monthly Budget</span>
                        <span className="font-semibold">{currencySymbol}{user.monthlyBudget.toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between items-center p-3 rounded-md bg-secondary">
                        <span className="text-sm font-medium text-muted-foreground">Currency</span>
                        <span className="font-semibold">{user.currency} ({currencySymbol})</span>
                    </div>
                    <Separator />
                    <SalaryCard user={user} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Tag /> Custom Categories</CardTitle>
                    <CardDescription>Your personalized spending categories.</CardDescription>
                </CardHeader>
                <CardContent>
                     {allCategories.length > 0 ? (
                        <div className="space-y-2">
                            {allCategories.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-2 rounded-md border">
                                    <div className="flex items-center gap-3">
                                    <span className="text-xl">{cat.emoji}</span>
                                    <Badge style={{ backgroundColor: cat.color, color: '#fff' }}>{cat.name}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                     ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No custom categories created yet.</p>
                     )}
                </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target /> Category Budgets</CardTitle>
                <CardDescription>Your spending limits for specific categories.</CardDescription>
              </CardHeader>
              <CardContent>
                {allBudgets.length > 0 ? (
                    <div className="space-y-2">
                        {allBudgets.map(budget => (
                            <div key={budget.category} className="flex items-center justify-between p-3 rounded-md border">
                                <span className="font-medium">{budget.category}</span>
                                <span className="text-sm text-muted-foreground">
                                    {currencySymbol}{budget.amount.toLocaleString()} / month
                                </span>
                            </div>
                        ))}
                    </div>
                ): (
                    <p className="text-sm text-muted-foreground text-center py-4">No category budgets set yet.</p>
                )}
              </CardContent>
            </Card>
        </div>

      </main>
    </div>
  );
}

