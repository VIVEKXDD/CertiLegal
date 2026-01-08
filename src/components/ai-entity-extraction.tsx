
'use client';

import { useEffect, useState } from 'react';
import { runExtractEntities } from '@/lib/actions';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal, Users, Calendar, CircleDollarSign, Scale, Timer } from 'lucide-react';

interface EntityResult {
  parties: { name: string; role: string }[];
  dates: { date: string; description: string }[];
  monetaryAmounts: { amount: string; context: string }[];
  jurisdiction?: string;
  contractDuration?: string;
}

export default function AiEntityExtraction({ documentText }: { documentText: string }) {
  const [result, setResult] = useState<EntityResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEntities() {
      setIsLoading(true);
      setError(null);
      const entityResult = await runExtractEntities({ documentText });
      if ('error' in entityResult) {
        setError(entityResult.error);
      } else {
        setResult(entityResult);
      }
      setIsLoading(false);
    }
    fetchEntities();
  }, [documentText]);

  if (isLoading) {
    return <EntitySkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Extraction Failed</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!result || (result.parties.length === 0 && result.dates.length === 0 && result.monetaryAmounts.length === 0 && !result.jurisdiction && !result.contractDuration)) {
    return (
         <Card>
            <CardHeader>
                <CardTitle className="font-headline">Extracted Entities</CardTitle>
                <CardDescription>Key information automatically identified by the AI.</CardDescription>
            </CardHeader>
            <CardContent>
                <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>No Entities Found</AlertTitle>
                    <AlertDescription>The AI could not identify any key entities in this document.</AlertDescription>
                </Alert>
            </CardContent>
         </Card>
    );
  }


  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Extracted Entities</CardTitle>
                <CardDescription>Key information automatically identified by the AI.</CardDescription>
            </CardHeader>
        </Card>
        
        {result.parties.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2"><Users className="size-5 text-primary" /> Parties</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {result.parties.map((party, i) => <li key={i} className="text-sm p-2 bg-secondary/50 rounded-md"><strong>{party.name}</strong> ({party.role})</li>)}
                    </ul>
                </CardContent>
            </Card>
        )}

        {result.dates.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2"><Calendar className="size-5 text-primary" /> Key Dates</CardTitle>
                </CardHeader>
                <CardContent>
                     <ul className="space-y-2">
                        {result.dates.map((d, i) => <li key={i} className="text-sm p-2 bg-secondary/50 rounded-md"><strong>{d.date}:</strong> {d.description}</li>)}
                    </ul>
                </CardContent>
            </Card>
        )}

        {result.monetaryAmounts.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2"><CircleDollarSign className="size-5 text-primary" /> Monetary Amounts</CardTitle>
                </CardHeader>
                <CardContent>
                     <ul className="space-y-2">
                        {result.monetaryAmounts.map((m, i) => <li key={i} className="text-sm p-2 bg-secondary/50 rounded-md"><strong>{m.amount}</strong> - {m.context}</li>)}
                    </ul>
                </CardContent>
            </Card>
        )}

        {(result.jurisdiction || result.contractDuration) && (
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2"><Scale className="size-5 text-primary" /> Other Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {result.jurisdiction && (
                        <div>
                            <h4 className="font-semibold text-sm mb-1">Jurisdiction</h4>
                            <p className="text-sm p-2 bg-secondary/50 rounded-md">{result.jurisdiction}</p>
                        </div>
                    )}
                    {result.contractDuration && (
                         <div>
                            <h4 className="font-semibold text-sm mb-1">Contract Duration</h4>
                            <p className="text-sm p-2 bg-secondary/50 rounded-md">{result.contractDuration}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}
    </div>
  );
}


function EntitySkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                 <CardHeader>
                    <CardTitle className="font-headline">Extracted Entities</CardTitle>
                    <CardDescription>Key information automatically identified by the AI.</CardDescription>
                </CardHeader>
            </Card>
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-8 w-3/4" />
                </CardContent>
            </Card>
        </div>
    )
}
