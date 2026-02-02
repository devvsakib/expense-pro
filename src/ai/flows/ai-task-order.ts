'use server';

/**
 * @fileOverview An AI task ordering flow.
 *
 * - aiTaskOrder - A function that handles the task ordering process.
 * - AITaskOrderInput - The input type for the aiTaskOrder function.
 * - AITaskOrderOutput - The return type for the aiTaskOrder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AITaskOrderInputSchema = z.object({
  tasks: z.array(
    z.object({
      description: z.string().describe('The description of the task.'),
      deadline: z.string().describe('The deadline of the task.'),
      importance: z.string().describe('The importance of the task.'),
      estimatedEffort: z.string().describe('The estimated effort of the task.'),
    })
  ).describe('A list of tasks to be ordered.'),
});

export type AITaskOrderInput = z.infer<typeof AITaskOrderInputSchema>;

const AITaskOrderOutputSchema = z.object({
  orderedTasks: z.array(
    z.object({
      description: z.string().describe('The description of the task.'),
      deadline: z.string().describe('The deadline of the task.'),
      importance: z.string().describe('The importance of the task.'),
      estimatedEffort: z.string().describe('The estimated effort of the task.'),
    })
  ).describe('A list of tasks ordered by priority.'),
});

export type AITaskOrderOutput = z.infer<typeof AITaskOrderOutputSchema>;

export async function aiTaskOrder(input: AITaskOrderInput): Promise<AITaskOrderOutput> {
  return aiTaskOrderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTaskOrderPrompt',
  input: {schema: AITaskOrderInputSchema},
  output: {schema: AITaskOrderOutputSchema},
  prompt: `You are an AI assistant designed to help users prioritize their tasks for the day.

Given the following list of tasks, order them in the most efficient way, taking into account their deadlines, importance, and estimated effort.

Tasks:
{{#each tasks}}
- Description: {{{description}}}, Deadline: {{{deadline}}}, Importance: {{{importance}}}, Estimated Effort: {{{estimatedEffort}}}
{{/each}}

Return the tasks in the order they should be completed, as a JSON array.
Ensure that tasks with earlier deadlines and higher importance are prioritized.
Consider estimated effort when deciding between tasks with similar deadlines and importance.
`,
});

const aiTaskOrderFlow = ai.defineFlow(
  {
    name: 'aiTaskOrderFlow',
    inputSchema: AITaskOrderInputSchema,
    outputSchema: AITaskOrderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
