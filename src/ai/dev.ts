'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/explain-specific-clause.ts';
import '@/ai/flows/summarize-legal-document.ts';
import '@/ai/flows/identify-potential-risks.ts';
import '@/ai/flows/answer-document-questions.ts';
import '@/ai/flows/classify-document.ts';
import '@/ai/flows/generate-embeddings-flow.ts';
import '@/ai/flows/semantic-search-flow.ts';
import '@/ai/flows/classify-document-classical.ts';
import '@/ai/flows/generate-document-fingerprint.ts';
import '@/ai/flows/extract-legal-entities.ts';
