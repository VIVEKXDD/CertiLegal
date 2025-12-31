'use client';

import { useEffect, useState } from 'react';
import { getSummary } from '@/lib/actions';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';

export default function AiSummary({ documentText }: { documentText: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      setIsLoading(true);
      setError(null);
      const result = await getSummary({ documentText });
      if ('error' in result) {
        setError(result.error);
      } else {
        setSummary(result.summary);
      }
      setIsLoading(false);
    }
    fetchSummary();
  }, [documentText]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline">Document Summary</CardTitle>
        <CardDescription>A concise overview of the key terms and obligations.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
        {error && (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {summary && <div className="text-sm text-foreground/90 whitespace-pre-wrap prose max-w-none">{summary}</div>}
      </CardContent>
    </Card>
  );
}
