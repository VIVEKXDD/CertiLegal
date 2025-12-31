'use client';

import { useEffect, useState } from 'react';
import { getClauseExplanation } from '@/lib/actions';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';

interface ClauseExplainerProps {
  documentText: string;
  clause: string;
}

export default function ClauseExplainer({ documentText, clause }: ClauseExplainerProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExplanation() {
      setIsLoading(true);
      setError(null);
      const result = await getClauseExplanation({ documentText, clause });
      if ('error' in result) {
        setError(result.error);
      } else {
        setExplanation(result.plainLanguageExplanation);
      }
      setIsLoading(false);
    }
    if (clause) {
        fetchExplanation();
    }
  }, [documentText, clause]);

  return (
    <div className="py-4 space-y-4">
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-semibold mb-2">Selected Clause:</h4>
        <p className="text-sm text-muted-foreground italic">&quot;{clause}&quot;</p>
      </div>
      <div className="p-4 border rounded-lg">
        <h4 className="font-semibold mb-2">AI Explanation:</h4>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
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
        {explanation && <div className="text-sm text-foreground/90 whitespace-pre-wrap prose max-w-none">{explanation}</div>}
      </div>
    </div>
  );
}
