'use server';

/**
 * @fileOverview A flow for generating a single embedding for an entire document.
 *
 * - generateDocumentFingerprint - Creates a single vector embedding (fingerprint) for a document.
 * - GenerateDocumentFingerprintInput - The input type for the flow.
 * - GenerateDocumentFingerprintOutput - The return type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDocumentFingerprintInputSchema = z.object({
  documentText: z.string().describe('The full text content of the legal document.'),
});
export type GenerateDocumentFingerprintInput = z.infer<typeof GenerateDocumentFingerprintInputSchema>;

// The output is just the embedding array
const GenerateDocumentFingerprintOutputSchema = z.array(z.number());
export type GenerateDocumentFingerprintOutput = z.infer<typeof GenerateDocumentFingerprintOutputSchema>;

export async function generateDocumentFingerprint(
  input: GenerateDocumentFingerprintInput
): Promise<GenerateDocumentFingerprintOutput> {
  return generateDocumentFingerprintFlow(input);
}

const generateDocumentFingerprintFlow = ai.defineFlow(
  {
    name: 'generateDocumentFingerprintFlow',
    inputSchema: GenerateDocumentFingerprintInputSchema,
    outputSchema: GenerateDocumentFingerprintOutputSchema,
  },
  async (input) => {
    // Generate a single embedding for the entire document content.
    // The text-embedding-004 model can handle large inputs.
    const embedding = await ai.embed({
      embedder: 'googleai/text-embedding-004',
      content: input.documentText,
    });
    
    return embedding;
  }
);
