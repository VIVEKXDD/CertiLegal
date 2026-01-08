'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, FileText, FileWarning } from 'lucide-react';
import UploadDialog from '@/components/upload-dialog';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, serverTimestamp, addDoc, writeBatch, doc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { runGenerateEmbeddings, runGenerateDocumentFingerprint, type DocumentFingerprint } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Document {
  id: string;
  title: string;
  description: string;
  lastUpdated: any; // Firestore timestamp
}

interface DisplayDocument extends Omit<Document, 'lastUpdated'> {
  lastUpdated: string;
}

// State for duplicate handling
type DuplicateState = {
  isChecking: boolean;
  duplicates: DocumentFingerprint[];
  documentToAdd: { title: string; description: string; content: string; fingerprint: number[] } | null;
}

export default function DashboardPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [duplicateState, setDuplicateState] = useState<DuplicateState>({ isChecking: false, duplicates: [], documentToAdd: null });
  
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const [displayDocs, setDisplayDocs] = useState<DisplayDocument[] | null>(null);

  const documentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'documents'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: documents, isLoading } = useCollection<Document>(documentsQuery);

  useEffect(() => {
    if (documents) {
      const formattedDocs = documents.map(doc => ({
        ...doc,
        lastUpdated: doc.lastUpdated?.toDate ? doc.lastUpdated.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Just now'
      }));
      setDisplayDocs(formattedDocs);
    }
  }, [documents]);

  const handleDocumentAdd = async (newDoc: { title: string; description: string; content: string }) => {
    if (!firestore || !user) return;
    setIsUploadOpen(false); // Close the upload dialog immediately
    
    setDuplicateState({ ...duplicateState, isChecking: true });
    toast({
        title: "Checking for Duplicates...",
        description: "Analyzing document similarity.",
    });

    // 1. Generate fingerprint for the new document
    const fingerprintResult = await runGenerateDocumentFingerprint({ documentText: newDoc.content, userId: user.uid });
    
    setDuplicateState({ ...duplicateState, isChecking: false });

    if('error' in fingerprintResult) {
        toast({ variant: "destructive", title: "Analysis Failed", description: fingerprintResult.error });
        return;
    }
    
    const { fingerprint, duplicates } = fingerprintResult;
    
    const docWithFingerprint = { ...newDoc, fingerprint };

    // 2. If duplicates are found, show the confirmation dialog
    if(duplicates.length > 0) {
        setDuplicateState({ isChecking: false, duplicates, documentToAdd: docWithFingerprint });
    } else {
        // 3. If no duplicates, proceed directly to finalize the upload
        await finalizeDocumentAdd(docWithFingerprint);
    }
  };

  const finalizeDocumentAdd = async (docToAdd: { title: string; description: string; content: string; fingerprint: number[] }) => {
     if (!firestore || !user) return;

     // Reset duplicate state as we are proceeding
     setDuplicateState({ isChecking: false, duplicates: [], documentToAdd: null });

     try {
        toast({
            title: "Processing Document...",
            description: "Saving document and generating embeddings for semantic search.",
        });

        const docData = {
            title: docToAdd.title,
            description: docToAdd.description,
            content: docToAdd.content,
            fingerprint: docToAdd.fingerprint, // Save the fingerprint
            userId: user.uid,
            lastUpdated: serverTimestamp(),
        };
        
        const docRef = await addDoc(collection(firestore, 'documents'), docData);
        
        // Generate and save chunked embeddings
        const embeddingResult = await runGenerateEmbeddings({ documentText: docToAdd.content });

        if ('error' in embeddingResult) {
            throw new Error(embeddingResult.error);
        }

        const batch = writeBatch(firestore);
        const embeddingsCollectionRef = collection(firestore, 'embeddings');
        
        embeddingResult.embeddings.forEach((embeddingVector, index) => {
            const chunkText = embeddingResult.chunks[index];
            const newEmbeddingDocRef = doc(embeddingsCollectionRef);
            batch.set(newEmbeddingDocRef, {
            documentId: docRef.id,
            chunkIndex: index,
            chunkText: chunkText,
            embedding: embeddingVector,
            });
        });

        await batch.commit();

        toast({
            title: "Success!",
            description: `"${docToAdd.title}" has been added and indexed.`,
        });

     } catch (error: any) {
        console.error("Failed to add document or embeddings:", error);
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: error.message || "Could not save the document and its embeddings.",
        });
     }
  }
  
  return (
    <>
      <div className="p-4 md:p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-headline">My Documents</h1>
            <p className="text-muted-foreground">Browse and manage your legal documents.</p>
          </div>
          <Button onClick={() => setIsUploadOpen(true)}>
            <PlusCircle className="mr-2" />
            Upload New
          </Button>
        </header>

        {(isLoading || displayDocs === null || duplicateState.isChecking) && <p>Loading documents...</p>}

        {!isLoading && !duplicateState.isChecking && displayDocs && displayDocs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayDocs.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                 <Link href={`/dashboard/${doc.id}`} className="block h-full">
                    <CardHeader>
                        <CardTitle className="flex items-start gap-3">
                            <FileText className="mt-1 text-primary"/>
                            <span>{doc.title}</span>
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{doc.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                        Last updated: {doc.lastUpdated}
                        </p>
                    </CardContent>
                 </Link>
              </Card>
            ))}
          </div>
        ) : (
          !isLoading && !duplicateState.isChecking && (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <h3 className="text-xl font-semibold">No Documents Yet</h3>
              <p className="text-muted-foreground mt-2 mb-4">Click "Upload New" to get started.</p>
              <Button onClick={() => setIsUploadOpen(true)}>
                <PlusCircle className="mr-2" />
                Upload Document
              </Button>
            </div>
          )
        )}
      </div>
      
      {/* Dialogs */}
      <UploadDialog isOpen={isUploadOpen} onOpenChange={setIsUploadOpen} onDocumentAdd={handleDocumentAdd} />
      
      <AlertDialog open={duplicateState.duplicates.length > 0 && !!duplicateState.documentToAdd} onOpenChange={() => setDuplicateState({isChecking: false, duplicates: [], documentToAdd: null})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><FileWarning className="text-amber-500"/> Potential Duplicate Found</AlertDialogTitle>
            <AlertDialogDescription>
              This document appears to be very similar to one or more documents you've already uploaded.
              <ul className="mt-2 list-disc list-inside bg-secondary/50 p-2 rounded-md">
                {duplicateState.duplicates.map(dup => (
                    <li key={dup.id} className="text-sm">
                        <strong>{dup.title}</strong> (Similarity: {(dup.similarity * 100).toFixed(1)}%)
                    </li>
                ))}
              </ul>
              <br />
              Do you still want to add this new document?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDuplicateState({isChecking: false, duplicates: [], documentToAdd: null})}>Cancel Upload</AlertDialogCancel>
            <AlertDialogAction onClick={() => duplicateState.documentToAdd && finalizeDocumentAdd(duplicateState.documentToAdd)}>Yes, Add Anyway</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
