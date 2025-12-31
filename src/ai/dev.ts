'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/explain-specific-clause.ts';
import '@/ai/flows/summarize-legal-document.ts';
import '@/ai/flows/identify-potential-risks.ts';
import '@/ai/flows/answer-document-questions.ts';
import '@/ai/flows/classify-document.ts';
