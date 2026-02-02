'use server';

/**
 * @fileOverview AI-powered task prioritization flow.
 *
 * This file defines a Genkit flow that prioritizes a list of tasks based on their deadlines,
 * importance, and estimated effort, providing a suggested order for the day.
 *
 * @exports prioritizeTasks - The main function to initiate the task prioritization flow.
 * @exports TaskInput - The input type for the prioritizeTasks function.
 * @exports TaskOutput - The output type for the prioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskInputSchema = z.object({
  tasks: z.array(
    z.object({
      description: z.string().describe('A description of the task.'),
      deadline: z.string().describe('The deadline for the task (e.g., YYYY-MM-DD).'),
      importance: z
        .enum(['high', 'medium', 'low'])
        .describe('The importance of the task.'),
      estimatedEffort: z
        .string()
        .describe('Estimated effort in hours (e.g., 1 hour, 2.5 hours).'),
    })
  ).describe('A list of tasks to prioritize.'),
});
export type TaskInput = z.infer<typeof TaskInputSchema>;

const TaskOutputSchema = z.object({
  prioritizedTasks: z.array(
    z.object({
      description: z.string().describe('A description of the task.'),
      deadline: z.string().describe('The deadline for the task (e.g., YYYY-MM-DD).'),
      importance: z
        .enum(['high', 'medium', 'low'])
        .describe('The importance of the task.'),
      estimatedEffort: z
        .string()
        .describe('Estimated effort in hours (e.g., 1 hour, 2.5 hours).'),
    })
  ).describe('The list of tasks, reordered based on priority.'),
  reasoning: z
    .string()
    .describe('Explanation of why the tasks were prioritized this way.'),
});
export type TaskOutput = z.infer<typeof TaskOutputSchema>;

export async function prioritizeTasks(input: TaskInput): Promise<TaskOutput> {
  return prioritizeTasksFlow(input);
}

const prioritizeTasksPrompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: TaskInputSchema},
  output: {schema: TaskOutputSchema},
  prompt: `You are an AI assistant designed to prioritize a list of tasks.

  Given the following list of tasks, their deadlines, importance levels, and estimated effort, provide a prioritized list of tasks, ordered from most important to least important.
  Explain your reasoning for the chosen order.

  Tasks:
  {{#each tasks}}
  - Description: {{this.description}}
    Deadline: {{this.deadline}}
    Importance: {{this.importance}}
    Estimated Effort: {{this.estimatedEffort}}
  {{/each}}

  Prioritized Tasks:
  `, // The prompt will be completed by the LLM.
});

const prioritizeTasksFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: TaskInputSchema,
    outputSchema: TaskOutputSchema,
  },
  async input => {
    const {output} = await prioritizeTasksPrompt(input);
    return output!;
  }
);
