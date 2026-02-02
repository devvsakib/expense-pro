'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { UserProfile } from '@/app/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff, Lock, Wallet } from 'lucide-react';
import Link from 'next/link';
import { getCurrencySymbol } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SalaryCardProps {
  user: UserProfile;
}

const formSchema = z.object({
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function SalaryCard({ user }: SalaryCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const { toast } = useToast();
  const currencySymbol = getCurrencySymbol(user.currency);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '' },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (values.password === user.salaryPassword) {
      setIsUnlocked(true);
      setIsRevealed(true);
      toast({ title: 'Success', description: 'Salary unlocked.' });
    } else {
      form.setError('password', { message: 'Incorrect password.' });
    }
  };

  if (!user.salary || !user.salaryPassword) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            Your Salary
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center h-[100px]">
          <p className="text-sm text-muted-foreground">Salary not set up.</p>
          <Button variant="link" asChild>
            <Link href="/settings">Go to Settings</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isUnlocked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            Protected Salary
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
           <CardDescription className="text-xs pt-1">Enter password to view.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input type="password" placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <Button type="submit" size="sm">Unlock</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Your Salary</CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsRevealed(!isRevealed)}>
          {isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isRevealed ? `${currencySymbol}${user.salary.toLocaleString()}` : '••••••••'}
        </div>
        <p className="text-xs text-muted-foreground">Monthly salary amount</p>
      </CardContent>
    </Card>
  );
}
