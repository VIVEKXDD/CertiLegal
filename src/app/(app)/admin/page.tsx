
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trainClassificationModel } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, ShieldAlert, FileText, Users, MessageSquareHeart, BookMarked } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';

const ADMIN_EMAIL = 'v@example.com';

// The format the classifier expects
type DatasetItem = { text: string; label: string };
// The format from the user's JSON file
type UserDatasetItem = { case_name: string; judgement_date: string; question: string; answer: string };

type Stats = {
  documents: number;
  users: number;
  feedback: number;
  glossary: number;
}

export default function AdminPage() {
  const [fileName, setFileName] = useState('');
  const [isTrainingFromFile, setIsTrainingFromFile] = useState(false);
  const [isTrainingFromFeedback, setIsTrainingFromFeedback] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const { toast } = useToast();
  const { user, isUserLoading, firestore } = useFirebase();

  useEffect(() => {
    if (!isUserLoading && user?.email === ADMIN_EMAIL && firestore) {
      const fetchStats = async () => {
        setIsLoadingStats(true);
        try {
          if (!firestore) throw new Error("Firestore is not available");
          
          const [docsSnap, usersSnap, feedbackSnap, glossarySnap] = await Promise.all([
            getCountFromServer(collection(firestore, 'documents')),
            getCountFromServer(collection(firestore, 'users')),
            getCountFromServer(collection(firestore, 'feedback')),
            getCountFromServer(collection(firestore, 'glossary')),
          ]);
          setStats({
            documents: docsSnap.data().count,
            users: usersSnap.data().count,
            feedback: feedbackSnap.data().count,
            glossary: glossarySnap.data().count,
          });
        } catch (error) {
          console.error("Error fetching stats:", error);
          toast({ variant: "destructive", title: "Could not load stats." });
        }
        setIsLoadingStats(false);
      };
      fetchStats();
    }
  }, [user, isUserLoading, firestore, toast]);


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/json') {
      setFileName(file.name);
      setIsTrainingFromFile(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        try {
          const parsed: UserDatasetItem[] = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.every(item => 'case_name' in item && 'question' in item)) {
            const transformedData: DatasetItem[] = parsed.map(item => ({
              text: `${item.case_name}: ${item.question}`,
              label: item.case_name
            }));
            
            toast({ title: "Training Started", description: "The model is being trained from the uploaded file..." });
            
            const result = await trainClassificationModel(transformedData, 'file');

            if ('error' in result) {
              throw new Error(result.error);
            }

            toast({ title: "Training Complete", description: `Model '${result.modelName}' trained on ${result.documentsProcessed} documents.` });

          } else {
            throw new Error("JSON must be an array of objects with 'case_name' and 'question' properties.");
          }
        } catch (error: any) {
          toast({ variant: "destructive", title: "Training Failed", description: error.message });
        } finally {
            setIsTrainingFromFile(false);
            event.target.value = ''; 
        }
      };
      reader.readAsText(file);
    } else {
        setFileName('');
        setIsTrainingFromFile(false);
        toast({ variant: "destructive", title: "Invalid File Type", description: "Please upload a valid JSON file." });
    }
  };
  
  const handleRetrainFromFeedback = async () => {
    setIsTrainingFromFeedback(true);
    toast({ title: "Retraining Started", description: "The model is being retrained from user feedback..." });

    try {
        const result = await trainClassificationModel([], 'feedback');

        if ('error' in result) {
            throw new Error(result.error);
        }
        
        toast({ title: "Retraining Complete", description: `New model '${result.modelName}' trained on ${result.documentsProcessed} feedback entries.` });

    } catch (error: any) {
        toast({ variant: "destructive", title: "Retraining Failed", description: error.message });
    } finally {
        setIsTrainingFromFeedback(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  if (user?.email !== ADMIN_EMAIL) {
    return (
       <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex flex-col items-center gap-2">
                <ShieldAlert className="size-12 text-destructive" />
                <span>Access Denied</span>
            </CardTitle>
            <CardDescription>This page is restricted to administrators.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  const isTraining = isTrainingFromFile || isTrainingFromFeedback;

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Admin Console</h1>
        <p className="text-muted-foreground">Manage models and view system statistics.</p>
      </header>

      <section>
        <h2 className="text-2xl font-semibold font-headline mb-4">System Statistics</h2>
        {isLoadingStats ? <p>Loading stats...</p> : stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.documents}</div>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users}</div>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Feedback Submitted</CardTitle>
                  <MessageSquareHeart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.feedback}</div>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Glossary Terms</CardTitle>
                  <BookMarked className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.glossary}</div>
                </CardContent>
              </Card>
          </div>
        )}
      </section>

      <section>
         <h2 className="text-2xl font-semibold font-headline mb-4">Model Training</h2>
        <Card>
          <CardHeader>
            <CardTitle>Classical Model Training</CardTitle>
            <CardDescription>
              Train the baseline classification model using an uploaded dataset or from user feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="dataset-upload">Option 1: Train from File</Label>
              <div className="flex items-center gap-4">
                  <Button asChild variant="outline" disabled={isTraining}>
                      <label htmlFor="dataset-upload" className="cursor-pointer">
                          {isTrainingFromFile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {isTrainingFromFile ? "Training..." : "Upload Dataset (.json)"}
                      </label>
                  </Button>
                  <Input id="dataset-upload" type="file" accept=".json" onChange={handleFileChange} className="hidden" disabled={isTraining} />
                  {fileName && !isTrainingFromFile && <p className="text-sm text-muted-foreground">{fileName} processed.</p>}
              </div>
              <p className="text-xs text-muted-foreground">
                  The dataset should be a JSON array of objects, each with a `case_name` and `question` property.
              </p>
            </div>
          </CardContent>
          <Separator />
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label>Option 2: Retrain from User Feedback</Label>
              <p className="text-xs text-muted-foreground">
                  Use all the classification corrections submitted by users to create a new, improved model.
              </p>
              <Button onClick={handleRetrainFromFeedback} disabled={isTraining}>
                  {isTrainingFromFeedback && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isTrainingFromFeedback ? "Retraining..." : "Retrain from Feedback"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
