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
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  monthlyBudget: z.coerce.number().positive({ message: "Budget must be a positive number." }),
  currency: z.enum(currencyOptions.map(c => c.value) as [Currency, ...Currency[]]),
  salary: z.coerce.number().positive({ message: "Salary must be a positive number." }).optional().or(z.literal('')),
  salaryPassword: z.string().optional().refine(val => val === '' || val === undefined || val.length >= 4, {
        message: "Password must be at least 4 characters.",
    }),
}).refine(data => (data.salary && data.salary > 0) ? !!data.salaryPassword : true, {
    message: "A password is required if you set a salary.",
    path: ["salaryPassword"],
});

type SettingsFormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
  });
  
  useEffect(() => {
    setIsClient(true);
    const storedUser = localStorage.getItem('expense-tracker-user');
    if (storedUser) {
      const parsedUser: UserProfile = JSON.parse(storedUser);
      setUser(parsedUser);
      form.reset({
          ...parsedUser,
          salary: parsedUser.salary || '',
          salaryPassword: parsedUser.salaryPassword || '',
      });
    }
  }, [form]);

  function onSubmit(values: SettingsFormValues) {
    const updatedUser = { 
        ...user, 
        ...values,
        salary: values.salary || undefined,
        salaryPassword: values.salaryPassword || undefined
    } as UserProfile;
    setUser(updatedUser);
    localStorage.setItem('expense-tracker-user', JSON.stringify(updatedUser));
    toast({
      title: 'Settings saved!',
      description: 'Your profile has been updated.',
    });
  }

  const handleResetData = () => {
    localStorage.removeItem('expense-tracker-user');
    localStorage.removeItem('expense-tracker-expenses');
    toast({
        title: 'Data Reset',
        description: 'All your application data has been cleared.',
    });
    // Redirect to home which will trigger onboarding
    window.location.href = '/';
  }
  
  if (!isClient || !user) {
    // You can add a skeleton loader here
    return <div>Loading...</div>
  }

  return (
    <>
      <Header />
      <main className="container mx-auto py-8 px-4 max-w-2xl">
         <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
        </Link>
        <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
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
                    <Separator />
                    <CardTitle className="text-lg">Salary Settings</CardTitle>
                     <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="salary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly Salary (Optional)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g., 100000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="salaryPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Salary Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Min. 4 characters" {...field} />
                              </FormControl>
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

            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle/> Danger Zone</CardTitle>
                    <CardDescription>These actions are irreversible. Please be certain.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Reset All Data</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete all your
                                expenses and profile data from this device.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetData}>
                                Yes, reset my data
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}
