'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search as SearchIcon, Loader2, FileText } from 'lucide-react';
import { runSemanticSearch, type SearchResult } from '@/lib/actions';
import { useFirebase } from '@/firebase';
import Link from 'next/link';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useFirebase();

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim() || !user) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    const searchResponse = await runSemanticSearch(query, user.uid);

    if ('error' in searchResponse) {
      setError(searchResponse.error);
    } else {
      setResults(searchResponse);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Semantic Search</h1>
        <p className="text-muted-foreground">Search for concepts and clauses across all your documents.</p>
      </header>

      <form onSubmit={handleSearch} className="flex w-full max-w-2xl items-center space-x-2 mb-8">
        <Input
          type="search"
          placeholder="e.g., 'What are the confidentiality obligations?'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-base"
        />
        <Button type="submit" disabled={isLoading || !query.trim()}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SearchIcon className="mr-2" />}
          Search
        </Button>
      </form>

      {isLoading && (
        <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Searching...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="max-w-2xl">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Search Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <div className="max-w-4xl">
            {results.length > 0 ? (
                 <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Search Results</h2>
                    {results.map((result, index) => (
                        <Card key={index} className="overflow-hidden">
                             <CardHeader className="bg-muted/50 p-4 border-b">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <FileText className="text-primary size-4" />
                                    From: <Link href={`/dashboard/${result.documentId}`} className="hover:underline">{result.documentTitle}</Link>
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Similarity Score: {result.similarity.toFixed(4)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4">
                                <blockquote className="border-l-4 border-primary pl-4 text-sm text-foreground/80 italic">
                                    ...{result.chunkText.replace(/\\n/g, ' ')}...
                                </blockquote>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">No Results Found</h3>
                    <p className="text-muted-foreground mt-2">Your search did not match any document content.</p>
                    <p className="text-sm text-muted-foreground">Try rephrasing your query or checking your uploaded documents.</p>
                </div>
            )}
        </div>
      )}

      {!results && !isLoading && !error && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg max-w-2xl">
            <h3 className="text-xl font-semibold">Search Your Documents</h3>
            <p className="text-muted-foreground mt-2">Enter a query above to start searching.</p>
        </div>
      )}

    </div>
  );
}
