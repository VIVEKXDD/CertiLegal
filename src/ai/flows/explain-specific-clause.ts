
'use server';

/**
 * @fileOverview This flow explains a specific clause from a legal document in plain language.
 *
 * - explainSpecificClause - A function that accepts a legal document and a specific clause, then returns a simplified explanation.
 * - ExplainSpecificClauseInput - The input type for the explainSpecificClause function.
 * - ExplainSpecificClauseOutput - The return type for the explainSpecificClause function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainSpecificClauseInputSchema = z.object({
  documentText: z
    .string()
    .describe('The complete text of the legal document.'),
  clause: z
    .string()
    .describe('The specific clause from the document to be explained.'),
});
export type ExplainSpecificClauseInput = z.infer<typeof ExplainSpecificClauseInputSchema>;

const ExplainSpecificClauseOutputSchema = z.object({
  plainLanguageExplanation: z
    .string()
    .describe(
      'A plain language explanation of the meaning and implications of the clause.'
    ),
});
export type ExplainSpecificClauseOutput = z.infer<typeof ExplainSpecificClauseOutputSchema>;

export async function explainSpecificClause(
  input: ExplainSpecificClauseInput
): Promise<ExplainSpecificClauseOutput> {
  return explainSpecificClauseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainSpecificClausePrompt',
  input: {schema: ExplainSpecificClauseInputSchema},
  output: {schema: ExplainSpecificClauseOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert legal professional skilled at explaining complex legal jargon in plain, easy-to-understand language. A user has provided a legal document and has selected a specific clause they want explained. Your task is to provide a clear and concise explanation of the clause, its meaning, and its implications, without using legal jargon.

Legal Document:
{{{documentText}}}

Clause to Explain:
{{{clause}}}

Explanation:`,
});

const explainSpecificClauseFlow = ai.defineFlow(
  {
    name: 'explainSpecificClauseFlow',
    inputSchema: ExplainSpecificClauseInputSchema,
    outputSchema: ExplainSpecificClauseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
