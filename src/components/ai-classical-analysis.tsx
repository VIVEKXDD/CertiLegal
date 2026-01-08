'use client';

import { useEffect, useState } from 'react';
import { runClassifyDocumentClassical } from '@/lib/actions';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal, Cpu } from 'lucide-react';

interface ClassificationResult {
    category: string;
    modelUsed: string;
}

export default function AiClassicalAnalysis({ documentText }: { documentText: string }) {
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClassification() {
      setIsLoading(true);
      setError(null);
      const classificationResult = await runClassifyDocumentClassical({ documentText });
      if ('error' in classificationResult) {
        setError(classificationResult.error);
      } else {
        setResult(classificationResult);
      }
      setIsLoading(false);
    }
    fetchClassification();
  }, [documentText]);


  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2"><Cpu /> Classical ML Analysis</CardTitle>
        <CardDescription>Document classification using the baseline model you trained.</CardDescription>
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
                <AlertTitle>Analysis Failed</AlertTitle>
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
                    <p className="text-sm text-muted-foreground mb-1">Model Used</p>
                     <p className="text-sm text-foreground/90 p-3 bg-secondary/50 rounded-md border font-mono">{result.modelUsed}</p>
                </div>
            </div>
        )}
         {!isLoading && !result && !error && (
            <Alert>
                <Cpu className="h-4 w-4" />
                <AlertTitle>No Model Found</AlertTitle>
                <AlertDescription>
                    A model could not be loaded to perform this analysis. Please train a model on the Admin page.
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
