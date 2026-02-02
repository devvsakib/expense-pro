'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserProfile, Currency } from '@/app/types';
import { currencyOptions } from '@/app/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  monthlyBudget: z.coerce.number().positive({ message: "Budget must be a positive number." }),
  currency: z.enum(currencyOptions.map(c => c.value) as [Currency, ...Currency[]]),
});

type SettingsFormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('expense-tracker-user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      form.reset(parsedUser);
    }
  }, [form]);

  function onSubmit(values: SettingsFormValues) {
    const updatedUser = { ...user, ...values } as UserProfile;
    setUser(updatedUser);
    localStorage.setItem('expense-tracker-user', JSON.stringify(updatedUser));
    toast({
      title: 'Settings saved!',
      description: 'Your profile has been updated.',
    });
  }
  
  if (!user) {
    return <div>Loading...</div> // Or a skeleton
  }

  return (
    <>
      <Header />
      <main className="container mx-auto py-8 px-4 max-w-2xl">
         <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your profile and application settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="monthlyBudget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Budget</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currencyOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
