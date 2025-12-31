'use server';

/**
 * @fileOverview Identifies potential risks or unfavorable terms within a legal document based on AI analysis.
 *
 * - identifyPotentialRisks - A function that handles the identification of potential risks in a legal document.
 * - IdentifyPotentialRisksInput - The input type for the identifyPotentialRisks function.
 * - IdentifyPotentialRisksOutput - The return type for the identifyPotentialRisks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyPotentialRisksInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the legal document to analyze.'),
  userInput: z
    .string()
    .optional()
    .describe('Optional user input or specific concerns about the document.'),
});
export type IdentifyPotentialRisksInput = z.infer<
  typeof IdentifyPotentialRisksInputSchema
>;

const IdentifyPotentialRisksOutputSchema = z.object({
  riskAssessment: z
    .string()
    .describe(
      'A comprehensive assessment of potential risks and unfavorable terms identified in the document.'
    ),
  riskSuggestions: z
    .string()
    .describe(
      'Actionable suggestions and advice on how to mitigate or address the identified risks.'
    ),
});
export type IdentifyPotentialRisksOutput = z.infer<
  typeof IdentifyPotentialRisksOutputSchema
>;

export async function identifyPotentialRisks(
  input: IdentifyPotentialRisksInput
): Promise<IdentifyPotentialRisksOutput> {
  return identifyPotentialRisksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyPotentialRisksPrompt',
  input: {schema: IdentifyPotentialRisksInputSchema},
  output: {schema: IdentifyPotentialRisksOutputSchema},
  prompt: `You are an AI legal assistant tasked with identifying potential risks and unfavorable terms in legal documents.

  Analyze the following legal document and identify any potential risks or unfavorable terms for the user. Consider the user's specific concerns if provided.

  Legal Document:
  {{documentText}}

  User Input:
  {{userInput}}

  First, provide a detailed risk assessment, explaining the potential implications of each identified risk.
  
  Second, provide actionable suggestions for how the user could address or mitigate these risks. This could include negotiation points, questions to ask the other party, or clauses to reconsider.
  `,
});

const identifyPotentialRisksFlow = ai.defineFlow(
  {
    name: 'identifyPotentialRisksFlow',
    inputSchema: IdentifyPotentialRisksInputSchema,
    outputSchema: IdentifyPotentialRisksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
