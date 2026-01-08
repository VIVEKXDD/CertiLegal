'use client';

import { useEffect, useState } from 'react';
import { runClassifyDocument, saveFeedback } from '@/lib/actions';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal, FileBadge, MessageSquareHeart } from 'lucide-react';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { FeedbackDialog } from './feedback-dialog';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { useParams } from 'next/navigation';

interface ClassificationResult {
    category: string;
    confidence: number;
    reasoning: string;
}

const DocumentCategories = [
    "Employment Agreement",
    "Non-Disclosure Agreement (NDA)",
    "Lease Agreement",
    "Loan Agreement",
    "Partnership Agreement",
    "Terms of Service",
    "Privacy Policy",
    "Will and Testament",
    "Other/Uncertain"
];

export default function AiClassification({ documentText }: { documentText: string }) {
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useFirebase();
  const params = useParams();
  const docId = params.docId as string;

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

  const handleFeedbackSubmit = async (correctedValue: string, comment: string) => {
    if (!user || !docId || !result) return;
    
    const feedbackData = {
      userId: user.uid,
      documentId: docId,
      feature: 'classification',
      originalValue: result.category,
      correctedValue,
      comment,
    };
    
    const response = await saveFeedback(feedbackData);
    
    if ('error' in response) {
      toast({
        variant: "destructive",
        title: "Feedback Error",
        description: response.error,
      });
    } else {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for helping improve our AI!",
      });
    }
    setIsFeedbackDialogOpen(false);
  };

  const confidencePercentage = result ? Math.round(result.confidence * 100) : 0;

  return (
    <>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="font-headline flex items-center gap-2"><FileBadge /> Document Type Classification</CardTitle>
            <CardDescription>AI-powered prediction of the document's category.</CardDescription>
          </div>
          {result && (
            <Button variant="outline" size="sm" onClick={() => setIsFeedbackDialogOpen(true)}>
              <MessageSquareHeart className="mr-2 h-4 w-4" />
              Provide Feedback
            </Button>
          )}
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

      {result && (
        <FeedbackDialog
          isOpen={isFeedbackDialogOpen}
          onOpenChange={setIsFeedbackDialogOpen}
          onSubmit={handleFeedbackSubmit}
          originalValue={result.category}
          options={DocumentCategories}
        />
      )}
    </>
  );
}
