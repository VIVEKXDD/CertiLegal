'use server';

/**
 * @fileOverview A flow for generating document embeddings.
 *
 * - generateEmbeddings - Splits a document into chunks and generates an embedding for each.
 * - GenerateEmbeddingsInput - The input type for the flow.
 * - GenerateEmbeddingsOutput - The return type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEmbeddingsInputSchema = z.object({
  documentText: z.string().describe('The full text content of the legal document.'),
});
export type GenerateEmbeddingsInput = z.infer<typeof GenerateEmbeddingsInputSchema>;

const GenerateEmbeddingsOutputSchema = z.object({
    chunks: z.array(z.string()).describe('The array of text chunks from the document.'),
    embeddings: z.array(z.array(z.number())).describe('An array of embedding vectors, one for each chunk.'),
});
export type GenerateEmbeddingsOutput = z.infer<typeof GenerateEmbeddingsOutputSchema>;


// Simple chunking function (can be improved with more sophisticated strategies)
const chunkText = (text: string, chunkSize = 500, overlap = 50) => {
    const chunks = [];
    let i = 0;
    while (i < text.length) {
        const end = Math.min(i + chunkSize, text.length);
        chunks.push(text.slice(i, end));
        i += chunkSize - overlap;
    }
    return chunks;
};


export async function generateEmbeddings(
  input: GenerateEmbeddingsInput
): Promise<GenerateEmbeddingsOutput> {
  return generateEmbeddingsFlow(input);
}


const generateEmbeddingsFlow = ai.defineFlow(
  {
    name: 'generateEmbeddingsFlow',
    inputSchema: GenerateEmbeddingsInputSchema,
    outputSchema: GenerateEmbeddingsOutputSchema,
  },
  async (input) => {

    const chunks = chunkText(input.documentText);

    const embeddingVectors = await Promise.all(
        chunks.map(chunk => ai.embed({
            embedder: 'googleai/text-embedding-004',
            content: chunk,
        }))
    );
    
    return {
        chunks: chunks,
        embeddings: embeddingVectors,
    };
  }
);
