'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import ClauseExplainer from './clause-explainer';
import { Download } from 'lucide-react';

interface Document {
    id: string;
    title: string;
    description: string;
    content: string;
    lastUpdated: string;
}

export default function DocumentViewer({ document }: { document: Document }) {
  const [selectedClause, setSelectedClause] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleClauseClick = (clauseText: string) => {
    setSelectedClause(clauseText);
  };

  const handleExplainClick = () => {
    if (selectedClause) {
      setIsSheetOpen(true);
    }
  };

  // Split content into paragraphs to simulate clauses
  const clauses = document.content.split('\\n\\n').filter(p => p.trim() !== '');

  return (
    <>
      <div className="p-6 relative h-full">
        <div className="flex justify-between items-start mb-2">
            <div>
                <h1 className="text-3xl font-bold font-headline">{document.title}</h1>
                <p className="text-muted-foreground mt-1">{document.description}</p>
            </div>
            {/* 
              This is a placeholder for a future download feature. 
              It uses a standard <a> tag to avoid Next.js routing issues with file URLs.
              It is currently disabled because the app does not yet store the original files.
            */}
            <Button asChild variant="outline" disabled>
                <a href="#" download>
                    <Download className="mr-2" />
                    Download
                </a>
            </Button>
        </div>
        
        {selectedClause && (
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-3 mb-4 border-b">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold">Clause Selected</p>
                <Button onClick={handleExplainClick} size="sm">Explain Clause</Button>
              </div>
          </div>
        )}

        <div className="prose prose-sm max-w-none font-body text-foreground/90 mt-6">
          {clauses.map((clause, index) => (
            <p
              key={index}
              onClick={() => handleClauseClick(clause)}
              className={`cursor-pointer p-2 rounded-md transition-colors ${
                selectedClause === clause
                  ? 'bg-primary/10 ring-1 ring-primary'
                  : 'hover:bg-accent/50'
              }`}
            >
              {clause.replace(/\\n/g, ' ')}
            </p>
          ))}
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Clause Explanation</SheetTitle>
            <SheetDescription>
              AI-powered explanation of the selected clause.
            </SheetDescription>
          </SheetHeader>
          {selectedClause && (
            <ClauseExplainer documentText={document.content} clause={selectedClause} />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
