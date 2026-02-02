'use server';

/**
 * @fileOverview An AI flow for a financial chat assistant.
 *
 * This file defines a Genkit flow that allows a user to have a conversation
 * with an AI about their financial data.
 *
 * @exports financialChat - The main function to interact with the chat AI.
 * @exports FinancialChatInput - The input type for the financialChat function.
 * @exports FinancialChatOutput - The output type for the financialChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const FinancialChatInputSchema = z.object({
  user: z.object({
    name: z.string(),
    currency: z.string(),
    monthlyBudget: z.number(),
  }),
  expenses: z.array(
    z.object({
      title: z.string(),
      amount: z.number(),
      category: z.string(),
      date: z.string(),
    })
  ),
  messages: z.array(ChatMessageSchema),
});
export type FinancialChatInput = z.infer<typeof FinancialChatInputSchema>;

const FinancialChatOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s response to the user.'),
});
export type FinancialChatOutput = z.infer<typeof FinancialChatOutputSchema>;


export async function financialChat(input: FinancialChatInput): Promise<FinancialChatOutput> {
  return financialChatFlow(input);
}


const financialChatPrompt = ai.definePrompt({
  name: 'financialChatPrompt',
  input: {schema: FinancialChatInputSchema},
  output: {schema: FinancialChatOutputSchema},
  prompt: `You are XPNS AI, a friendly and helpful financial assistant for a user named {{user.name}}.
Your currency is {{user.currency}} and their monthly budget is {{user.monthlyBudget}}.
Analyze the user's conversation and the provided expense data to answer their questions.
Be conversational and provide clear, concise answers.
When providing amounts, use the user's currency symbol.
Keep your answers brief and to the point.

Current Date: ${new Date().toISOString().split('T')[0]}

EXPENSE DATA:
{{#if expenses.length}}
  {{#each expenses}}
  - {{this.title}} ({{this.category}}): {{this.amount}} on {{this.date}}
  {{/each}}
{{else}}
  No expenses logged.
{{/if}}

CONVERSATION HISTORY:
{{#each messages}}
- {{this.role}}: {{this.content}}
{{/each}}
- assistant:`,
});

const financialChatFlow = ai.defineFlow(
  {
    name: 'financialChatFlow',
    inputSchema: FinancialChatInputSchema,
    outputSchema: FinancialChatOutputSchema,
  },
  async input => {
    const {output} = await financialChatPrompt(input);
    return output!;
  }
);
