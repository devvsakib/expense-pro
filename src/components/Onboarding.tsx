
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserProfile, Currency, OcrEngine } from "@/app/types";
import { currencyOptions, ocrEngineOptions } from "@/app/types";
import { AnimatePresence, motion } from "framer-motion";
import { CompassIcon } from "@/components/icons";
import { Separator } from "./ui/separator";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const step1Schema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  monthlyBudget: z.coerce.number().positive({ message: "Budget must be a positive number." }),
  currency: z.enum(currencyOptions.map(c => c.value) as [Currency, ...Currency[]]),
});

const step2Schema = z.object({
    salary: z.coerce.number().positive({ message: "Salary must be a positive number." }).optional().or(z.literal('')),
    salaryPassword: z.string().optional().refine(val => val === '' || val === undefined || val.length >= 4, {
        message: "Password must be at least 4 characters.",
    }),
    apiKey: z.string().optional(),
    ocrEngine: z.enum(ocrEngineOptions).optional(),
}).refine(data => (data.salary && data.salary > 0) ? !!data.salaryPassword : true, {
    message: "Password is required if salary is provided.",
    path: ["salaryPassword"],
});


type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});

  const formStep1 = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: "",
      monthlyBudget: 1000,
      currency: "BDT",
    },
  });

  const formStep2 = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      salary: '',
      salaryPassword: "",
      apiKey: "",
      ocrEngine: 'multimodal-ai',
    },
  });

  function onStep1Submit(values: Step1Values) {
    setProfileData(values);
    setStep(2);
  }

  function onStep2Submit(values: Step2Values) {
    const finalProfile: UserProfile = {
        ...profileData,
        ...values,
        salary: values.salary || undefined,
        salaryPassword: values.salaryPassword || undefined,
        apiKey: values.apiKey || undefined,
        customCategories: [],
        defaultStatus: 'completed',
        defaultRecurrence: 'one-time',
        ocrEngine: values.ocrEngine || 'multimodal-ai'
    } as UserProfile;
    onComplete(finalProfile);
  }

  const handleSkip = () => {
    const finalProfile: UserProfile = {
      ...profileData,
      customCategories: [],
      defaultStatus: 'completed',
      defaultRecurrence: 'one-time',
      ocrEngine: 'multimodal-ai',
    } as UserProfile;
    onComplete(finalProfile);
  };
  
  const variants = {
    hidden: { opacity: 0, x: 200 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -200 },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg overflow-hidden">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
                <CompassIcon className="h-7 w-7 text-primary" />
                <CardTitle className="text-3xl font-bold">Welcome to XPNS!</CardTitle>
            </div>
          <CardDescription>Let's get your financial profile set up.</CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Form {...formStep1}>
                  <form onSubmit={formStep1.handleSubmit(onStep1Submit)} className="space-y-6">
                    <FormField
                      control={formStep1.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What should we call you?</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={formStep1.control}
                        name="monthlyBudget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Budget</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 50000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={formStep1.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Button type="submit" className="w-full">
                      Next Step
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}
            
            {step === 2 && (
              <motion.div
                key="step2"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Form {...formStep2}>
                    <form onSubmit={formStep2.handleSubmit(onStep2Submit)} className="space-y-6">
                        <CardTitle className="text-xl text-center">Optional Details</CardTitle>
                        
                        <FormField
                          control={formStep2.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Google AI API Key</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter your API key" {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormDescription>
                                For AI features. You can get a key from Google AI Studio.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                            control={formStep2.control}
                            name="ocrEngine"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>Receipt Scanning Engine</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                    >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="multimodal-ai" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        Multimodal AI (Recommended)
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="tesseract-ai" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        Inbuilt AI
                                        </FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                         <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={formStep2.control}
                              name="salary"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Monthly Salary</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="e.g., 100000" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={formStep2.control}
                              name="salaryPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Create Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="Min. 4 characters" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">Your salary information will be password-protected.</p>


                        <div className="flex gap-4">
                            <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>
                                Back
                            </Button>
                            <Button type="submit" className="w-full">
                                Finish Setup
                            </Button>
                        </div>
                         <Button type="button" variant="link" className="w-full" onClick={handleSkip}>
                            Skip and Finish
                        </Button>
                    </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
