'use server';

/**
 * @fileOverview An AI agent that classifies a document using a pre-trained classical model from Firestore.
 *
 * - classifyDocumentClassical - A function that handles the document classification process.
 * - ClassifyDocumentClassicalInput - The input type for the function.
 * - ClassifyDocumentClassicalOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getFirestore} from 'firebase-admin/firestore';
import {initializeApp, getApps} from 'firebase-admin/app';
import {LogisticRegressionClassifier} from 'natural';

// Initialize Firebase Admin SDK if not already done
if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

const ClassifyDocumentClassicalInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the legal document to classify.'),
});
export type ClassifyDocumentClassicalInput = z.infer<
  typeof ClassifyDocumentClassicalInputSchema
>;

const ClassifyDocumentClassicalOutputSchema = z.object({
  category: z
    .string()
    .describe('The predicted category from the classical model.'),
  modelUsed: z.string().describe('The name of the model used for classification.'),
});
export type ClassifyDocumentClassicalOutput = z.infer<
  typeof ClassifyDocumentClassicalOutputSchema
>;

export async function classifyDocumentClassical(
  input: ClassifyDocumentClassicalInput
): Promise<ClassifyDocumentClassicalOutput> {
  return classifyDocumentClassicalFlow(input);
}

const classifyDocumentClassicalFlow = ai.defineFlow(
  {
    name: 'classifyDocumentClassicalFlow',
    inputSchema: ClassifyDocumentClassicalInputSchema,
    outputSchema: ClassifyDocumentClassicalOutputSchema,
  },
  async input => {
    // 1. Fetch the latest model from Firestore
    const modelsSnapshot = await db
      .collection('ml_models')
      .orderBy('trainedAt', 'desc')
      .limit(1)
      .get();

    if (modelsSnapshot.empty) {
      throw new Error('No trained models found in Firestore.');
    }

    const modelDoc = modelsSnapshot.docs[0];
    const modelData = modelDoc.data();
    const modelJson = modelData.modelJson;
    const modelName = modelData.name || 'unknown-model';

    // 2. Load the classifier from the stored JSON
    const classifier = LogisticRegressionClassifier.restore(JSON.parse(modelJson));

    // 3. Classify the input document text
    const category = classifier.classify(input.documentText);
    
    return {
      category,
      modelUsed: modelName,
    };
  }
);
