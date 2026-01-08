
'use server';

/**
 * @fileOverview An AI agent that answers questions about a legal document using Retrieval-Augmented Generation (RAG).
 *
 * - answerDocumentQuestions - A function that handles the question answering process.
 * - AnswerDocumentQuestionsInput - The input type for the answerDocumentQuestions function.
 * - AnswerDocumentQuestionsOutput - The return type for the answerDocumentQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { runSemanticSearch } from '@/lib/actions';

const AnswerDocumentQuestionsInputSchema = z.object({
  documentId: z.string().describe('The ID of the legal document.'),
  userId: z.string().describe('The ID of the user asking the question.'),
  question: z.string().describe('The question about the legal document.'),
});
export type AnswerDocumentQuestionsInput = z.infer<typeof AnswerDocumentQuestionsInputSchema>;

const AnswerDocumentQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the legal document.'),
  context: z.array(z.string()).describe('The relevant document chunks used to generate the answer.'),
});
export type AnswerDocumentQuestionsOutput = z.infer<typeof AnswerDocumentQuestionsOutputSchema>;

export async function answerDocumentQuestions(input: AnswerDocumentQuestionsInput): Promise<AnswerDocumentQuestionsOutput> {
  return answerDocumentQuestionsFlow(input);
}


// 1. Define the tool for our agent to use: Semantic Search
const searchTool = ai.defineTool(
  {
    name: 'documentSearch',
    description: 'Searches for relevant clauses or sections within the specified legal document.',
    inputSchema: z.object({
        query: z.string().describe("The user's question or search query."),
    }),
    outputSchema: z.array(
        z.object({
            chunkText: z.string(),
            documentTitle: z.string(),
            similarity: z.number(),
        })
    )
  },
  async (input) => {
    // Note: The flow's input gives us userId and documentId, but the tool only needs the query.
    // We'll need to pass the other IDs from the main flow logic.
    // This is a placeholder for the real search logic.
    return []; 
  }
);


// 2. Define the prompt that will use the tool
const prompt = ai.definePrompt({
  name: 'answerDocumentQuestionsPrompt',
  input: {
    schema: z.object({
        question: z.string(),
        context: z.array(z.string()),
    })
  },
  output: {schema: AnswerDocumentQuestionsOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are a helpful legal assistant. Your task is to answer the user's question based *only* on the provided context chunks from the legal document.

  If the provided context does not contain the answer, state that you cannot answer based on the information provided. Do not use any external knowledge.

  ## Provided Context:
  {{#each context}}
  - {{{this}}}
  {{/each}}

  ## User's Question:
  {{question}}
  
  ## Answer:
  `,
});


// 3. Define the main flow that orchestrates the RAG process
const answerDocumentQuestionsFlow = ai.defineFlow(
  {
    name: 'answerDocumentQuestionsFlow',
    inputSchema: AnswerDocumentQuestionsInputSchema,
    outputSchema: AnswerDocumentQuestionsOutputSchema,
  },
  async (input) => {
    
    // Step 1: Use semantic search to find relevant document chunks (the "Retrieval" step).
    const searchResults = await runSemanticSearch(input.question, input.userId, 5);

    if('error' in searchResults) {
        throw new Error(searchResults.error);
    }
    
    const contextChunks = searchResults.map(r => r.chunkText);

    // Step 2: Pass the retrieved chunks and the original question to the LLM (the "Generation" step).
    const llmResponse = await prompt({
        question: input.question,
        context: contextChunks,
    });
    
    // Step 3: Return the final answer and the context that was used.
    return {
        answer: llmResponse.output!.answer,
        context: contextChunks,
    };
  }
);
