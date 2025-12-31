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
