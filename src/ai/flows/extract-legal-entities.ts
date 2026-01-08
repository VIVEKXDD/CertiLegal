
'use server';

/**
 * @fileOverview An AI agent that extracts structured entities from a legal document.
 *
 * - extractLegalEntities - A function that handles the entity extraction process.
 * - ExtractLegalEntitiesInput - The input type for the function.
 * - ExtractLegalEntitiesOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractLegalEntitiesInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the legal document to analyze.'),
});
export type ExtractLegalEntitiesInput = z.infer<
  typeof ExtractLegalEntitiesInputSchema
>;

const ExtractLegalEntitiesOutputSchema = z.object({
  parties: z.array(z.object({
    name: z.string().describe("The name of the person or organization."),
    role: z.string().describe("The role of the party (e.g., 'Landlord', 'Employee', 'Lender')."),
  })).describe("A list of all parties mentioned in the document."),
  dates: z.array(z.object({
      date: z.string().describe("The date found in the text (e.g., '2023-01-01')."),
      description: z.string().describe("The context of the date (e.g., 'Effective Date', 'Termination Date').")
  })).describe("Key dates mentioned in the document."),
  monetaryAmounts: z.array(z.object({
      amount: z.string().describe("The monetary value (e.g., '$10,000')."),
      context: z.string().describe("The context of the amount (e.g., 'Monthly Rent', 'Loan Principal').")
  })).describe("Financial figures or values mentioned."),
  jurisdiction: z.string().optional().describe("The governing law or jurisdiction (e.g., 'State of California, USA')."),
  contractDuration: z.string().optional().describe("The term or length of the contract (e.g., '2 years', 'until terminated').")
});
export type ExtractLegalEntitiesOutput = z.infer<
  typeof ExtractLegalEntitiesOutputSchema
>;

export async function extractLegalEntities(
  input: ExtractLegalEntitiesInput
): Promise<ExtractLegalEntitiesOutput> {
  return extractLegalEntitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractLegalEntitiesPrompt',
  input: {schema: ExtractLegalEntitiesInputSchema},
  output: {schema: ExtractLegalEntitiesOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are a specialized legal Named Entity Recognition (NER) system. Your task is to analyze the provided legal document and extract the following entities. If an entity is not present, return an empty array for that field.

  - Parties: Identify all individuals, companies, or organizations involved. Determine their role if possible.
  - Dates: Find all important dates and describe what they are for (e.g., Effective Date, Signing Date).
  - Monetary Amounts: Extract any financial figures and their context (e.g., Purchase Price, Monthly Salary).
  - Jurisdiction: Identify the state, country, or legal body whose laws govern the document.
  - Contract Duration: Determine the term or length of the agreement.

  Document Text:
  {{{documentText}}}
  `,
});

const extractLegalEntitiesFlow = ai.defineFlow(
  {
    name: 'extractLegalEntitiesFlow',
    inputSchema: ExtractLegalEntitiesInputSchema,
    outputSchema: ExtractLegalEntitiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
