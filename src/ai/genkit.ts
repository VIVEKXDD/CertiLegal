
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
      // Set a default model for generation to prevent "Must supply a model" errors.
      generationModel: 'googleai/gemini-2.5-flash',
    }),
  ],
});
