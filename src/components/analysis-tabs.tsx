'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AiSummary from "./ai-summary";
import AiRiskAssessment from "./ai-risk-assessment";
import AiChat from "./ai-chat";
import AiClassification from "./ai-classification";

export default function AnalysisTabs({ documentText, documentTitle }: { documentText: string, documentTitle: string }) {
    return (
        <Tabs defaultValue="summary" className="p-4 md:p-6 h-full flex flex-col">
            <div className="lg:hidden mb-4">
                <h2 className="text-2xl font-bold font-headline">{documentTitle}</h2>
            </div>
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="risks">Risks</TabsTrigger>
                <TabsTrigger value="qa">Q&A</TabsTrigger>
                <TabsTrigger value="classify">Classify</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="flex-1 mt-4 overflow-y-auto">
                <AiSummary documentText={documentText} />
            </TabsContent>
            <TabsContent value="risks" className="flex-1 mt-4 overflow-y-auto">
                <AiRiskAssessment documentText={documentText} />
            </TabsContent>
            <TabsContent value="qa" className="flex-1 mt-4 h-full overflow-hidden">
                <AiChat documentText={documentText} />
            </TabsContent>
             <TabsContent value="classify" className="flex-1 mt-4 overflow-y-auto">
                <AiClassification documentText={documentText} />
            </TabsContent>
        </Tabs>
    )
}
