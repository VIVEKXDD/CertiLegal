'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AiSummary from "./ai-summary";
import AiRiskAssessment from "./ai-risk-assessment";
import AiChat from "./ai-chat";
import AiComparisonAnalysis from "./ai-comparison-analysis";
import AiEntityExtraction from "./ai-entity-extraction";
import { ScrollText, FileSearch, MessagesSquare, Shield, ListTree } from "lucide-react";

export default function AnalysisTabs({ documentText, documentTitle }: { documentText: string, documentTitle: string }) {
    return (
        <Tabs defaultValue="summary" className="p-4 md:p-6 h-full flex flex-col">
            <div className="lg:hidden mb-4">
                <h2 className="text-2xl font-bold font-headline">{documentTitle}</h2>
            </div>
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5">
                <TabsTrigger value="summary"><ScrollText className="mr-2 h-4 w-4" />Summary</TabsTrigger>
                <TabsTrigger value="entities"><ListTree className="mr-2 h-4 w-4" />Entities</TabsTrigger>
                <TabsTrigger value="risks"><Shield className="mr-2 h-4 w-4" />Risks</TabsTrigger>
                <TabsTrigger value="qa"><MessagesSquare className="mr-2 h-4 w-4" />Q&A</TabsTrigger>
                <TabsTrigger value="classify"><FileSearch className="mr-2 h-4 w-4" />Classification</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="flex-1 mt-4 overflow-y-auto">
                <AiSummary documentText={documentText} />
            </TabsContent>
            <TabsContent value="entities" className="flex-1 mt-4 overflow-y-auto">
                <AiEntityExtraction documentText={documentText} />
            </TabsContent>
            <TabsContent value="risks" className="flex-1 mt-4 overflow-y-auto">
                <AiRiskAssessment documentText={documentText} />
            </TabsContent>
            <TabsContent value="qa" className="flex-1 mt-4 h-full overflow-hidden">
                <AiChat />
            </TabsContent>
             <TabsContent value="classify" className="flex-1 mt-4 overflow-y-auto">
                <AiComparisonAnalysis documentText={documentText} />
            </TabsContent>
        </Tabs>
    )
}
