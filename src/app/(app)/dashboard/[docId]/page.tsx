
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DocumentViewer from '@/components/document-viewer';
import AnalysisTabs from '@/components/analysis-tabs';
import { useFirebase } from '@/firebase';
import { doc, getDoc, DocumentReference } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DocumentData {
  title: string;
  description: string;
  content: string;
  lastUpdated: any;
  userId: string;
}

// Define the possible states for the page
type PageState = 'loading' | 'success' | 'unauthorized' | 'not-found';

export default function DocumentPage() {
  const params = useParams();
  const docId = params.docId as string;
  const { firestore, user, isUserLoading } = useFirebase();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [document, setDocument] = useState<DocumentData | null>(null);

  useEffect(() => {
    // This effect runs when auth state or the document ID changes.
    // It is responsible for fetching the document and setting the final page state.

    // 1. Do not proceed until Firebase has finished its initial authentication check.
    if (isUserLoading) {
      setPageState('loading');
      return;
    }

    // 2. If auth is complete but there is no user, they are unauthorized.
    if (!user) {
      setPageState('unauthorized');
      return;
    }

    // 3. If we have a user, proceed to fetch the document from Firestore.
    const fetchDocument = async () => {
      setPageState('loading');
      const docRef = doc(firestore, 'documents', docId) as DocumentReference<DocumentData>;
      
      try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const docData = docSnap.data();
          
          // 4. Document exists. Now perform the security check on the client.
          // Is the logged-in user the owner, OR are they the special admin user?
          if (docData.userId === user.uid || user.email === 'v@example.com') {
            setDocument(docData);
            setPageState('success');
          } else {
            // Document exists, but user is not the owner.
            setPageState('unauthorized');
          }
        } else {
          // 5. The document with this ID does not exist in Firestore.
          setPageState('not-found');
        }
      } catch (error) {
        // This could be a network error or a more fundamental issue.
        console.error("Error fetching document:", error);
        setPageState('not-found'); // Default to not-found on error
      }
    };

    fetchDocument();

  }, [docId, user, isUserLoading, firestore]);

  // === RENDER LOGIC BASED ON PAGE STATE ===

  if (pageState === 'loading') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  if (pageState === 'unauthorized') {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex flex-col items-center gap-2">
                <ShieldAlert className="size-12 text-destructive" />
                <span>Access Denied</span>
            </CardTitle>
            <CardDescription>You do not have permission to view this document.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (pageState === 'not-found') {
     return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex flex-col items-center gap-2">
                <FileQuestion className="size-12 text-muted-foreground" />
                <span>Document Not Found</span>
            </CardTitle>
            <CardDescription>The document you are looking for does not exist or could not be loaded.
            <br />
            <Button asChild variant="link" className="mt-4">
                <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (pageState === 'success' && document) {
    const displayDocument = {
      ...document,
      id: docId,
      lastUpdated: document.lastUpdated?.toDate 
        ? document.lastUpdated.toDate().toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          }) 
        : 'N/A',
    };

    return (
      <div className="grid lg:grid-cols-2 h-full">
        <div className="h-full overflow-y-auto border-r hidden lg:block">
          <DocumentViewer document={displayDocument} />
        </div>
        <div className="h-full overflow-y-auto bg-secondary/20">
          <AnalysisTabs 
            documentText={displayDocument.content} 
            documentTitle={displayDocument.title} 
          />
        </div>
      </div>
    );
  }

  // Fallback case, should not be reached
  return null;
}

