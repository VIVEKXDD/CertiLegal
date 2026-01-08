'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SemanticSearchInputSchema = z.object({
  queryText: z.string(),
});

export type SemanticSearchInput = z.infer<typeof SemanticSearchInputSchema>;
export type SemanticSearchOutput = number[];

export async function semanticSearch(
  input: SemanticSearchInput
): Promise<SemanticSearchOutput> {
  return semanticSearchFlow(input);
}

const semanticSearchFlow = ai.defineFlow(
  {
    name: 'semanticSearchFlow',
    inputSchema: SemanticSearchInputSchema,
    outputSchema: z.array(z.number()),
  },
  async (input) => {
    const result = await ai.embed({
      embedder: 'googleai/text-embedding-004',
      content: input.queryText,
    });

    // 🔥 THIS IS THE KEY LINE
    return result[0].embedding;
  }
);
