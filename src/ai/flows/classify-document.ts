
'use server';

/**
 * @fileOverview An AI agent that classifies the type of a legal document.
 *
 * - classifyDocument - A function that handles the document classification process.
 * - ClassifyDocumentInput - The input type for the classifyDocument function.
 * - ClassifyDocumentOutput - The return type for the classifyDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyDocumentInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the legal document to classify.'),
});
export type ClassifyDocumentInput = z.infer<
  typeof ClassifyDocumentInputSchema
>;

const DocumentCategorySchema = z.enum([
    "Employment Agreement",
    "Non-Disclosure Agreement (NDA)",
    "Lease Agreement",
    "Loan Agreement",
    "Partnership Agreement",
    "Terms of Service",
    "Privacy Policy",
    "Will and Testament",
    "Other/Uncertain"
]);


const ClassifyDocumentOutputSchema = z.object({
  category: DocumentCategorySchema.describe("The predicted category of the legal document."),
  confidence: z.number().min(0).max(1).describe("A confidence score (0.0 to 1.0) for the prediction."),
  reasoning: z.string().describe("A brief justification for the chosen category based on the document's content."),
});
export type ClassifyDocumentOutput = z.infer<
  typeof ClassifyDocumentOutputSchema
>;

export async function classifyDocument(
  input: ClassifyDocumentInput
): Promise<ClassifyDocumentOutput> {
  return classifyDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyDocumentPrompt',
  input: {schema: ClassifyDocumentInputSchema},
  output: {schema: ClassifyDocumentOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are a legal document classification expert. Analyze the following document text and determine its most likely category from the provided list.

  Provide a confidence score for your classification and a brief reasoning based on keywords or clauses you identified.

  Possible Categories:
  - Employment Agreement
  - Non-Disclosure Agreement (NDA)
  - Lease Agreement
  - Loan Agreement
  - Partnership Agreement
  - Terms of Service
  - Privacy Policy
  - Will and Testament
  - Other/Uncertain

  Document Text:
  {{{documentText}}}
  `,
});

const classifyDocumentFlow = ai.defineFlow(
  {
    name: 'classifyDocumentFlow',
    inputSchema: ClassifyDocumentInputSchema,
    outputSchema: ClassifyDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
