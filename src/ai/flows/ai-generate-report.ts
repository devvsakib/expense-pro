'use server';

/**
 * @fileOverview AI-powered spending report generation flow.
 *
 * This file defines a Genkit flow that analyzes a user's expenses and generates a
 * helpful report with insights and tips.
 *
 * @exports generateReport - The main function to initiate the report generation.
 * @exports ReportInput - The input type for the generateReport function.
 * @exports ReportOutput - The output type for the generateReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReportInputSchema = z.object({
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
});
export type ReportInput = z.infer<typeof ReportInputSchema>;

const ReportOutputSchema = z.object({
  report: z
    .string()
    .describe(
      'A detailed, insightful, and friendly spending report in Markdown format.'
    ),
});
export type ReportOutput = z.infer<typeof ReportOutputSchema>;

export async function generateReport(input: ReportInput): Promise<ReportOutput> {
  return generateReportFlow(input);
}

const generateReportPrompt = ai.definePrompt({
  name: 'generateReportPrompt',
  input: {schema: ReportInputSchema},
  output: {schema: ReportOutputSchema},
  prompt: `You are a friendly financial assistant named XPNS AI. Your goal is to provide a helpful and easy-to-understand spending report.

User's name: {{user.name}}
Monthly Budget: {{user.monthlyBudget}} {{user.currency}}

Here are the user's recent expenses for the selected period:
{{#each expenses}}
- {{this.title}} ({{this.category}}): {{this.amount}} {{../user.currency}} on {{this.date}}
{{/each}}

Based on this data, generate a spending report in Markdown format.

The report should include:
1.  A brief, friendly opening addressing the user by name.
2.  A summary of total spending vs. budget for the period.
3.  An analysis of the top 2-3 spending categories.
4.  One or two specific, actionable tips for saving money based on their spending habits.
5.  A positive and encouraging closing statement.

Make the report insightful but not judgmental. Use formatting like bolding and bullet points to make it readable. Keep the report concise and to the point.`,
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: ReportInputSchema,
    outputSchema: ReportOutputSchema,
  },
  async (input) => {
    if (input.expenses.length === 0) {
      return {
        report:
          "There are no expenses to analyze in the selected period. Add some expenses or adjust your filters to get your first AI report!",
      };
    }
    const {output} = await generateReportPrompt(input);
    return output!;
  }
);
