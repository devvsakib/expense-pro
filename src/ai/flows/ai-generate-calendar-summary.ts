
'use server';

/**
 * @fileOverview AI-powered calendar day summary generation.
 *
 * This file defines a Genkit flow that analyzes a day's expenses and tasks
 * and generates a helpful natural language summary.
 *
 * @exports generateCalendarSummary - The main function to initiate the summary generation.
 * @exports CalendarSummaryInput - The input type for the generateCalendarSummary function.
 * @exports CalendarSummaryOutput - The output type for the generateCalendarSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalendarSummaryInputSchema = z.object({
  date: z.string().describe("The date for the summary, in 'Month day, year' format."),
  expenses: z
    .array(
      z.object({
        title: z.string(),
        amount: z.number(),
        category: z.string(),
      })
    )
    .describe('The list of expenses for the day.'),
  tasks: z
    .array(
      z.object({
        description: z.string(),
        completed: z.boolean(),
      })
    )
    .describe('The list of tasks due on the day.'),
  currencySymbol: z.string().describe('The currency symbol to use for money.'),
});
export type CalendarSummaryInput = z.infer<typeof CalendarSummaryInputSchema>;

const CalendarSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A friendly, insightful summary of the day in Markdown format.'
    ),
});
export type CalendarSummaryOutput = z.infer<typeof CalendarSummaryOutputSchema>;

export async function generateCalendarSummary(input: CalendarSummaryInput): Promise<CalendarSummaryOutput> {
  return generateCalendarSummaryFlow(input);
}

const generateSummaryPrompt = ai.definePrompt({
  name: 'generateCalendarSummaryPrompt',
  input: {schema: CalendarSummaryInputSchema},
  output: {schema: CalendarSummaryOutputSchema},
  prompt: `You are an AI assistant who provides helpful daily summaries.
Analyze the provided tasks and expenses for {{date}}.

TASKS ({{tasks.length}}):
{{#if tasks.length}}
  {{#each tasks}}
  - {{this.description}} ({{#if this.completed}}Completed{{else}}Incomplete{{/if}})
  {{/each}}
{{else}}
  No tasks scheduled.
{{/if}}

EXPENSES ({{expenses.length}}):
{{#if expenses.length}}
  {{#each expenses}}
  - {{this.title}} ({{this.category}}): {{../currencySymbol}}{{this.amount}}
  {{/each}}
{{else}}
  No expenses logged.
{{/if}}

Based on this, generate a brief, friendly summary for the day.
Start with a general overview. If there are tasks, mention how many are completed vs. incomplete.
If there are expenses, mention the total number and maybe the most significant category.
Keep it concise and encouraging. Address the user directly ("You have...", "Your spending...").
`,
});

const generateCalendarSummaryFlow = ai.defineFlow(
  {
    name: 'generateCalendarSummaryFlow',
    inputSchema: CalendarSummaryInputSchema,
    outputSchema: CalendarSummaryOutputSchema,
  },
  async (input) => {
    if (input.expenses.length === 0 && input.tasks.length === 0) {
      return {
        summary: "There's nothing on the schedule for this day. A perfect time to relax or plan ahead!",
      };
    }
    const {output} = await generateSummaryPrompt(input);
    return output!;
  }
);
