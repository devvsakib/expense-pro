'use server';

/**
 * @fileOverview AI-powered expense categorization flow.
 *
 * This file defines a Genkit flow that suggests a category for a given
 * expense title.
 *
 * @exports suggestCategory - The main function to initiate category suggestion.
 * @exports SuggestCategoryInput - The input type for the suggestCategory function.
 * @exports SuggestCategoryOutput - The output type for the suggestCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCategoryInputSchema = z.object({
  title: z.string().describe("The title or description of the expense."),
  categories: z.array(z.string()).describe("A list of possible expense categories to choose from."),
});
export type SuggestCategoryInput = z.infer<typeof SuggestCategoryInputSchema>;

const SuggestCategoryOutputSchema = z.object({
  category: z.string().describe("The suggested category for the expense. Must be one of the provided categories."),
});
export type SuggestCategoryOutput = z.infer<typeof SuggestCategoryOutputSchema>;


export async function suggestCategory(input: SuggestCategoryInput): Promise<SuggestCategoryOutput> {
  return suggestCategoryFlow(input);
}

const suggestCategoryPrompt = ai.definePrompt({
  name: 'suggestCategoryPrompt',
  input: {schema: SuggestCategoryInputSchema},
  output: {schema: SuggestCategoryOutputSchema},
  prompt: `You are an expert at categorizing expenses. Based on the expense title, suggest the most logical category from the provided list.

Expense Title: "{{title}}"

Available Categories:
{{#each categories}}
- {{this}}
{{/each}}

Analyze the title and return ONLY the name of the best category from the list provided.`,
});


const suggestCategoryFlow = ai.defineFlow(
  {
    name: 'suggestCategoryFlow',
    inputSchema: SuggestCategoryInputSchema,
    outputSchema: SuggestCategoryOutputSchema,
  },
  async input => {
    if (!input.title || input.title.length < 3) {
        throw new Error("A descriptive title is required to suggest a category.");
    }
    const {output} = await suggestCategoryPrompt(input);
    return output!;
  }
);
