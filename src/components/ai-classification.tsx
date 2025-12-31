'use client';

import { useEffect, useState } from 'react';
import { runClassifyDocument } from '@/lib/actions';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal, FileBadge, BarChart } from 'lucide-react';
import { Progress } from './ui/progress';

interface ClassificationResult {
    category: string;
    confidence: number;
    reasoning: string;
}

export default function AiClassification({ documentText }: { documentText: string }) {
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClassification() {
      setIsLoading(true);
      setError(null);
      const classificationResult = await runClassifyDocument({ documentText });
      if ('error' in classificationResult) {
        setError(classificationResult.error);
      } else {
        setResult(classificationResult);
      }
      setIsLoading(false);
    }
    fetchClassification();
  }, [documentText]);

  const confidencePercentage = result ? Math.round(result.confidence * 100) : 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2"><FileBadge /> Document Type Classification</CardTitle>
        <CardDescription>AI-powered prediction of the document's category.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}
        {error && (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {result && (
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">Predicted Category</p>
                    <h3 className="text-2xl font-bold font-headline text-primary">{result.category}</h3>
                </div>
                 <div>
                    <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                    <div className="flex items-center gap-3">
                        <Progress value={confidencePercentage} className="w-full" />
                        <span className="font-bold text-lg">{confidencePercentage}%</span>
                    </div>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground mb-1">Reasoning</p>
                    <p className="text-sm text-foreground/90 p-3 bg-secondary/50 rounded-md border">{result.reasoning}</p>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
