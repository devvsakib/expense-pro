'use server';

/**
 * @fileOverview AI-powered savings coach flow.
 *
 * This file defines a Genkit flow that analyzes a user's spending habits
 * against a savings goal and provides an actionable plan.
 *
 * @exports generateSavingsPlan - The main function to initiate the savings plan generation.
 * @exports SavingsPlanInput - The input type for the generateSavingsPlan function.
 * @exports SavingsPlanOutput - The output type for the generateSavingsPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SavingsPlanInputSchema = z.object({
  expenses: z
    .array(
      z.object({
        title: z.string(),
        amount: z.number(),
        category: z.string(),
        date: z.string(),
      })
    )
    .describe("The user's list of expenses to analyze."),
  user: z
    .object({
      name: z.string(),
      monthlyBudget: z.number(),
      currency: z.string(),
    })
    .describe("The user's profile information."),
  goal: z.object({
    name: z.string().describe('The name of the savings goal (e.g., "Vacation").'),
    amount: z.number().describe('The target amount to save.'),
  }).describe('The savings goal details.'),
});
export type SavingsPlanInput = z.infer<typeof SavingsPlanInputSchema>;

const SavingsPlanOutputSchema = z.object({
  plan: z
    .string()
    .describe(
      'A detailed, actionable savings plan in Markdown format.'
    ),
});
export type SavingsPlanOutput = z.infer<typeof SavingsPlanOutputSchema>;

export async function generateSavingsPlan(input: SavingsPlanInput): Promise<SavingsPlanOutput> {
  return generateSavingsPlanFlow(input);
}

const generateSavingsPlanPrompt = ai.definePrompt({
  name: 'generateSavingsPlanPrompt',
  input: {schema: SavingsPlanInputSchema},
  output: {schema: SavingsPlanOutputSchema},
  prompt: `You are a friendly and motivational AI Savings Coach named XPNS AI. Your goal is to help users reach their financial goals.

User's name: {{user.name}}
Monthly Budget: {{user.monthlyBudget}} {{user.currency}}
Savings Goal: Save {{goal.amount}} {{user.currency}} for "{{goal.name}}".

Here are the user's recent expenses for the selected period:
{{#if expenses}}
  {{#each expenses}}
  - {{this.title}} ({{this.category}}): {{this.amount}} {{../user.currency}} on {{this.date}}
  {{/each}}
{{else}}
  No expenses were provided for this period.
{{/if}}

Based on this data, create a realistic, step-by-step savings plan in Markdown format.

The plan should include:
1.  An encouraging opening acknowledging their goal.
2.  An analysis of their spending, highlighting the top 2-3 categories where they can save.
3.  A specific, actionable list of suggestions. For each suggestion, specify the category and a recommended monthly saving amount (e.g., "Reduce 'Shopping' by 50 {{user.currency}}/month").
4.  An estimated timeline for how long it will take to reach their goal based on your suggestions.
5.  A motivational closing statement to inspire them to stick to the plan.

Be positive and empowering. If there isn't enough expense data, explain that more data would lead to a better plan but still provide some general savings tips. Use formatting like bolding and lists to make the plan easy to read.`,
});

const generateSavingsPlanFlow = ai.defineFlow(
  {
    name: 'generateSavingsPlanFlow',
    inputSchema: SavingsPlanInputSchema,
    outputSchema: SavingsPlanOutputSchema,
  },
  async (input) => {
    const {output} = await generateSavingsPlanPrompt(input);
    return output!;
  }
);
