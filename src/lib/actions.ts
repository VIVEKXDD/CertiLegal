
'use server';

import {
    summarizeLegalDocument,
    SummarizeLegalDocumentInput,
    SummarizeLegalDocumentOutput
} from '@/ai/flows/summarize-legal-document';
import {
    explainSpecificClause,
    ExplainSpecificClauseInput,
    ExplainSpecificClauseOutput
} from '@/ai/flows/explain-specific-clause';
import {
    identifyPotentialRisks,
    IdentifyPotentialRisksInput,
    IdentifyPotentialRisksOutput
} from '@/ai/flows/identify-potential-risks';
import {
    answerDocumentQuestions,
    AnswerDocumentQuestionsInput,
    AnswerDocumentQuestionsOutput
} from '@/ai/flows/answer-document-questions';
import {
    classifyDocument as classifyDocumentFlow,
    ClassifyDocumentInput,
    ClassifyDocumentOutput
} from '@/ai/flows/classify-document';
import {
    classifyDocumentClassical as classifyDocumentClassicalFlow,
    ClassifyDocumentClassicalInput,
    ClassifyDocumentClassicalOutput
} from '@/ai/flows/classify-document-classical';
import {
    generateEmbeddings,
    GenerateEmbeddingsInput,
    GenerateEmbeddingsOutput
} from '@/ai/flows/generate-embeddings-flow';
import {
    generateDocumentFingerprint as generateDocumentFingerprintFlow,
    GenerateDocumentFingerprintInput,
    GenerateDocumentFingerprintOutput
} from '@/ai/flows/generate-document-fingerprint';
import {
    semanticSearch,
    SemanticSearchInput,
    SemanticSearchOutput
} from '@/ai/flows/semantic-search-flow';
import {
    extractLegalEntities,
    ExtractLegalEntitiesInput,
    ExtractLegalEntitiesOutput
} from '@/ai/flows/extract-legal-entities';
import { LogisticRegressionClassifier, TfIdf } from 'natural';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps } from 'firebase-admin/app';

// In a managed environment like App Hosting, the Admin SDK is often auto-initialized.
// We only initialize if no apps are present to avoid conflicts.
if (!getApps().length) {
    initializeApp();
}
const db = getFirestore();
const adminAuth = getAuth();


// Type definition for an embedding document from Firestore
interface EmbeddingDocument {
    documentId: string;
    chunkIndex: number;
    chunkText: string;
    embedding: number[];
}

// Type definition for a legal document from Firestore
interface LegalDocument {
    title: string;
    description?: string;
    userId: string;
    content: string; // Needed for retraining
    fingerprint?: number[];
}

// Type definition for the final search result
export interface SearchResult {
    documentId: string;
    documentTitle: string;
    chunkText: string;
    similarity: number;
}

// Type definition for duplicate check result
export interface DocumentFingerprint {
  id: string;
  title: string;
  similarity: number;
}

// Type definition for feedback data
export interface FeedbackData {
    userId: string;
    documentId: string;
    feature: string;
    originalValue: string;
    correctedValue: string;
    comment: string;
}


const DUPLICATE_THRESHOLD = 0.995;

// Helper function for cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }
    return dotProduct / (magnitudeA * magnitudeB);
}


export async function getSummary(input: SummarizeLegalDocumentInput): Promise<SummarizeLegalDocumentOutput | { error: string }> {
    try {
        const summary = await summarizeLegalDocument(input);
        return summary;
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Failed to generate summary.' };
    }
}

export async function getClauseExplanation(input: ExplainSpecificClauseInput): Promise<ExplainSpecificClauseOutput | { error:string }> {
    try {
        const explanation = await explainSpecificClause(input);
        return explanation;
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Failed to explain clause.' };
    }
}

export async function getRiskAssessment(input: IdentifyPotentialRisksInput): Promise<IdentifyPotentialRisksOutput | { error: string }> {
    try {
        const risks = await identifyPotentialRisks(input);
        return risks;
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Failed to assess risks.' };
    }
}

export async function getAnswer(input: AnswerDocumentQuestionsInput): Promise<AnswerDocumentQuestionsOutput | { error: string }> {
    try {
        const answer = await answerDocumentQuestions(input);
        return answer;
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Failed to get answer.' };
    }
}

export async function runClassifyDocument(input: ClassifyDocumentInput): Promise<ClassifyDocumentOutput | { error: string }> {
    try {
        const classification = await classifyDocumentFlow(input);
        return classification;
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Failed to classify document.' };
    }
}

export async function runClassifyDocumentClassical(input: ClassifyDocumentClassicalInput): Promise<ClassifyDocumentClassicalOutput | { error: string }> {
    try {
        const classification = await classifyDocumentClassicalFlow(input);
        return classification;
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Failed to classify document with classical model.' };
    }
}

export async function runGenerateEmbeddings(input: GenerateEmbeddingsInput): Promise<GenerateEmbeddingsOutput | { error: string }> {
    try {
        const result = await generateEmbeddings(input);
        return result;
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Failed to generate embeddings.' };
    }
}

export async function runGenerateDocumentFingerprint(input: { documentText: string, userId: string }): Promise<{ fingerprint: number[], duplicates: DocumentFingerprint[] } | { error: string }> {
    try {
        // 1. Generate the fingerprint for the new document
        const fingerprint = await generateDocumentFingerprintFlow({documentText: input.documentText});

        // 2. Fetch all existing documents for the user
        const userDocsSnapshot = await db.collection('documents').where('userId', '==', input.userId).get();
        if (userDocsSnapshot.empty) {
            return { fingerprint, duplicates: [] };
        }
        
        // 3. Calculate similarity against each existing document's fingerprint
        const duplicates: DocumentFingerprint[] = [];
        for (const doc of userDocsSnapshot.docs) {
            const docData = doc.data() as LegalDocument;
            if (docData.fingerprint && docData.fingerprint.length > 0) {
                const similarity = cosineSimilarity(fingerprint, docData.fingerprint);
                if (similarity > DUPLICATE_THRESHOLD) {
                    duplicates.push({
                        id: doc.id,
                        title: docData.title,
                        similarity,
                    });
                }
            }
        }

        // 4. Sort duplicates by highest similarity first
        duplicates.sort((a, b) => b.similarity - a.similarity);

        return { fingerprint, duplicates };

    } catch (e: any) {
        console.error("Duplicate detection failed:", e);
        return { error: e.message || "An unknown error occurred during duplicate detection." }
    }
}

export async function trainClassificationModel(dataset: {text: string, label: string}[], trainingMode: 'file' | 'feedback' = 'file'): Promise<{ modelName: string, documentsProcessed: number } | { error: string }> {
    try {
        let trainingData = dataset;

        if (trainingMode === 'feedback') {
            // 1. Fetch all feedback documents
            const feedbackSnapshot = await db.collection('feedback').where('feature', '==', 'classification').get();
            if (feedbackSnapshot.empty) {
                throw new Error("No feedback data found to train from.");
            }

            // 2. Get the unique document IDs from the feedback
            const docIds = [...new Set(feedbackSnapshot.docs.map(doc => doc.data().documentId))];
            
            // 3. Fetch all the required documents in a single query
            const docsSnapshot = await db.collection('documents').where(FieldValue.documentId(), 'in', docIds).get();
            const documentsData: Record<string, string> = {};
            docsSnapshot.forEach(doc => {
                const data = doc.data() as LegalDocument;
                documentsData[doc.id] = data.content;
            });
            
            // 4. Create the training set from feedback
            trainingData = feedbackSnapshot.docs.map(doc => {
                const feedback = doc.data();
                const documentText = documentsData[feedback.documentId];
                if (!documentText) {
                    // This case should be rare, but good to handle
                    console.warn(`Document content for ID ${feedback.documentId} not found.`);
                    return null;
                }
                return {
                    text: documentText, // Use the full document text
                    label: feedback.correctedValue, // The user-provided correct label
                };
            }).filter((item): item is {text: string, label: string} => item !== null);
        }

        if (!trainingData || trainingData.length === 0) {
            throw new Error("No training data available.");
        }
        
        const classifier = new LogisticRegressionClassifier();
        
        // Use TfIdf to handle text, which is better for this use case
        const tfidf = new TfIdf();
        trainingData.forEach(item => {
            tfidf.addDocument(item.text);
        });

        trainingData.forEach((item, i) => {
            classifier.addDocument(tfidf.listTerms(i).map(term => term.term), item.label);
        });
        
        classifier.train();
        
        const modelJson = JSON.stringify(classifier);
        const modelName = `baseline-classifier-v${Date.now()}`;
        
        await db.collection('ml_models').add({
            name: modelName,
            modelJson: modelJson,
            trainedAt: new Date().toISOString(),
            type: 'LogisticRegressionClassifier'
        });

        return { modelName, documentsProcessed: trainingData.length };

    } catch(e: any) {
        console.error("Model training failed:", e);
        return { error: e.message || "An unknown error occurred during training." }
    }
}


export async function runSemanticSearch(query: string, userId: string, topK = 5): Promise<SearchResult[] | { error: string }> {
    try {
        // 1. Generate embedding for the user's query.
        const queryEmbedding = await semanticSearch({ queryText: query });

        // 2. Fetch all documents for the user to get their IDs and titles
        const userDocsSnapshot = await db.collection('documents').where('userId', '==', userId).get();
        if (userDocsSnapshot.empty) {
            return []; // No documents for this user
        }
        
        const userDocsData: { [id: string]: LegalDocument } = {};
        userDocsSnapshot.docs.forEach(doc => {
            userDocsData[doc.id] = doc.data() as LegalDocument;
        });
        const userDocIds = Object.keys(userDocsData);

        // 3. Fetch ALL embeddings from the collection.
        // This is inefficient and should be replaced with a vector DB in production.
        const allEmbeddingsSnapshot = await db.collection('embeddings').get();
        if (allEmbeddingsSnapshot.empty) {
            return [];
        }

        // 4. Filter the embeddings in code to get only the ones belonging to the user's documents.
        const userEmbeddings = allEmbeddingsSnapshot.docs
            .map(doc => doc.data() as EmbeddingDocument)
            .filter(embedding => userDocIds.includes(embedding.documentId));

        if (userEmbeddings.length === 0) {
             return []; // No embeddings found for user's documents
        }
        
        // 5. Calculate similarity for each of the user's document chunks.
        const similarities = userEmbeddings.map(docEmbedding => {
            const similarity = cosineSimilarity(queryEmbedding, docEmbedding.embedding);
            return {
                ...docEmbedding,
                similarity: similarity,
            };
        });

        // 6. Sort by similarity and take the top K
        const topResults = similarities.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
        
        // 7. Format the final results, retrieving the document title from our earlier fetch.
        const finalResults: SearchResult[] = topResults.map(result => ({
            documentId: result.documentId,
            documentTitle: userDocsData[result.documentId]?.title || 'Untitled Document',
            chunkText: result.chunkText,
            similarity: result.similarity,
        }));

        return finalResults;

    } catch (e: any) {
        console.error("Semantic search failed:", e);
        return { error: e.name + ': ' + e.message || 'An unknown error occurred during search.' };
    }
}

export async function runExtractEntities(input: ExtractLegalEntitiesInput): Promise<ExtractLegalEntitiesOutput | { error: string }> {
    try {
        const result = await extractLegalEntities(input);
        return result;
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Failed to extract entities.' };
    }
}

export async function saveFeedback(feedback: FeedbackData): Promise<{ success: boolean } | { error: string }> {
    try {
        if (!feedback.userId || !feedback.documentId || !feedback.correctedValue) {
            throw new Error("Invalid feedback data. Required fields are missing.");
        }

        await db.collection('feedback').add({
            ...feedback,
            createdAt: new Date().toISOString(),
        });
        
        return { success: true };

    } catch (e: any) {
        console.error("Failed to save feedback:", e);
        return { error: e.message || "An unknown error occurred while saving feedback." };
    }
}

export async function updateUserName(input: { userId: string, newName: string }): Promise<{ success: boolean } | { error: string }> {
    try {
        const { userId, newName } = input;
        if (!userId || !newName) {
            throw new Error("User ID and new name are required.");
        }

        // Update Firebase Authentication
        await adminAuth.updateUser(userId, {
            displayName: newName,
        });

        // Update Firestore
        const userDocRef = db.collection('users').doc(userId);
        await userDocRef.update({
            name: newName,
        });

        return { success: true };
    } catch (e: any) {
        console.error("Failed to update user name:", e);
        return { error: e.message || "An unknown error occurred while updating the name." };
    }
}
