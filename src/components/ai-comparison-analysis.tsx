'use client';

import AiClassification from './ai-classification';
import AiClassicalAnalysis from './ai-classical-analysis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Lightbulb } from 'lucide-react';

export default function AiComparisonAnalysis({ documentText }: { documentText: string }) {
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AiClassification documentText={documentText} />
            <AiClassicalAnalysis documentText={documentText} />
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Lightbulb className="text-primary" />
                    Model Comparison: When to Use Each
                </CardTitle>
                <CardDescription>
                    Understanding the trade-offs between a powerful GenAI model and a fast classical model is key.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <h4 className="font-semibold mb-2 text-primary">GenAI Model (gemini-2.5-flash)</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                           <li><strong className="text-foreground">Higher Accuracy on Diverse Docs:</strong> Better at handling unexpected or novel document types due to its vast general knowledge.</li>
                           <li><strong className="text-foreground">Slower & More Expensive:</strong> Requires a network call to a large, external API, resulting in higher latency and cost per classification.</li>
                           <li><strong className="text-foreground">Provides Reasoning:</strong> Can explain *why* it chose a category, offering more insight.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 text-primary">Classical Model (Logistic Regression)</h4>
                         <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                           <li><strong className="text-foreground">Extremely Fast & Cheap:</strong> The model is small and runs locally on the server, making predictions in milliseconds with negligible cost.</li>
                           <li><strong className="text-foreground">Accuracy Depends on Training:</strong> Highly accurate for categories it's been trained on, but will fail on unseen document types.</li>
                           <li><strong className="text-foreground">Best for High-Volume, Defined Tasks:</strong> Ideal when you have a well-labeled dataset and need to classify a large number of documents into a fixed set of categories quickly.</li>
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
