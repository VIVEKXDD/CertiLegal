'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, FileText } from 'lucide-react';
import UploadDialog from '@/components/upload-dialog';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, serverTimestamp, addDoc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

interface Document {
  id: string;
  title: string;
  description: string;
  lastUpdated: any; // Firestore timestamp
}

export default function DashboardPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { firestore, user } = useFirebase();

  // Create a memoized query to fetch documents for the current user
  const documentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'documents'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: documents, isLoading } = useCollection<Document>(documentsQuery);

  const handleDocumentAdd = async (newDoc: { title: string; description: string; content: string }) => {
    if (!firestore || !user) return;

    const docData = {
      ...newDoc,
      userId: user.uid,
      lastUpdated: serverTimestamp(),
    };
    
    await addDoc(collection(firestore, 'documents'), docData);
    setIsUploadOpen(false); // Close the dialog after upload
  };
  
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

        {isLoading && <p>Loading documents...</p>}

        {!isLoading && documents && documents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
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
                        Last updated: {doc.lastUpdated?.toDate ? doc.lastUpdated.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Just now'}
                        </p>
                    </CardContent>
                 </Link>
              </Card>
            ))}
          </div>
        ) : (
          !isLoading && (
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
      <UploadDialog isOpen={isUploadOpen} onOpenChange={setIsUploadOpen} onDocumentAdd={handleDocumentAdd} />
    </>
  );
}
