
'use server';

/**
 * @fileOverview AI-powered receipt scanning flow.
 *
 * This file defines a Genkit flow that analyzes an image of a receipt and
 * extracts key information like the total amount, date, and vendor name.
 *
 * @exports scanReceipt - The main function to initiate receipt scanning.
 * @exports ReceiptScanInput - The input type for the scanReceipt function.
 * @exports ReceiptScanOutput - The output type for the scanReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReceiptScanInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  categories: z.array(z.string()).describe("A list of possible expense categories."),
});
export type ReceiptScanInput = z.infer<typeof ReceiptScanInputSchema>;

const ReceiptScanOutputSchema = z.object({
  title: z.string().describe("The name of the vendor or store. If not available, create a concise description of the purchase (e.g., 'Groceries from Market')."),
  amount: z.number().describe("The final total amount paid. It's usually labeled as 'Total', 'Grand Total', or 'Amount Paid'."),
  date: z.string().describe("The date of the transaction. Return it in YYYY-MM-DD format. If the year is not present, assume the current year."),
  category: z.string().describe("Based on the items or vendor, classify the expense into one of the provided categories."),
  notes: z.string().describe("A summary of the items purchased or the purpose of the expense. If individual items are listed, provide a brief summary (e.g., 'Milk, bread, eggs'). If no items are clear, leave this blank.").optional(),
});
export type ReceiptScanOutput = z.infer<typeof ReceiptScanOutputSchema>;


export async function scanReceipt(input: ReceiptScanInput): Promise<ReceiptScanOutput> {
  return scanReceiptFlow(input);
}

const scanReceiptPrompt = ai.definePrompt({
  name: 'scanReceiptPrompt',
  input: {schema: ReceiptScanInputSchema},
  output: {schema: ReceiptScanOutputSchema},
  prompt: `You are an expert receipt scanner. Analyze the provided receipt image and extract the following information:
1.  **Title**: The name of the vendor or store. If not available, create a concise description of the purchase (e.g., "Groceries from Market").
2.  **Amount**: The final total amount paid. It's usually labeled as "Total", "Grand Total", or "Amount Paid".
3.  **Date**: The date of the transaction. Return it in YYYY-MM-DD format. If the year is not present, assume the current year.
4.  **Category**: Based on the items or vendor, classify the expense into one of the following categories: {{#each categories}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}.
5.  **Notes**: A summary of the items purchased or the purpose of the expense. If individual items are listed, provide a brief summary (e.g., "Milk, bread, eggs"). If no items are clear, leave this blank.

Receipt Image:
{{media url=photoDataUri}}

Analyze the image and return the extracted information in the specified JSON format. Be as accurate as possible.`,
});


const scanReceiptFlow = ai.defineFlow(
  {
    name: 'scanReceiptFlow',
    inputSchema: ReceiptScanInputSchema,
    outputSchema: ReceiptScanOutputSchema,
  },
  async input => {
    // This is the real implementation that calls the AI model.
    const {output} = await scanReceiptPrompt(input);
    return output!;
  }
);
