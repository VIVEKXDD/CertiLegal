'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useFirebase, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, writeBatch, getDocs, query, doc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { BookMarked } from "lucide-react";
import { legalGlossaryTerms } from "@/lib/glossary-data";

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
}

export default function GlossaryPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [isSeeding, setIsSeeding] = useState(false);

  const glossaryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'glossary');
  }, [firestore]);

  const { data: glossaryTerms, isLoading, error, setData } = useCollection<GlossaryTerm>(glossaryQuery);
  
  useEffect(() => {
    const seedDataIfNeeded = async () => {
      // 1. Wait until authentication is resolved AND the initial data fetch is complete.
      if (isUserLoading || isLoading) {
        return;
      }
      
      // 2. Only proceed if we have a user, a valid firestore instance, and an empty glossary.
      if (user && firestore && glossaryTerms?.length === 0) {
        setIsSeeding(true);
        try {
          // 3. To prevent race conditions, double-check the server-side collection is empty.
          const serverQuery = query(collection(firestore, 'glossary'));
          const querySnapshot = await getDocs(serverQuery);
          
          if (querySnapshot.empty) {
            console.log("Seeding glossary data...");
            const batch = writeBatch(firestore);
            const newTerms: GlossaryTerm[] = [];
            
            legalGlossaryTerms.forEach((term) => {
              const docRef = doc(collection(firestore, 'glossary')); // Auto-generates ID
              batch.set(docRef, term);
              newTerms.push({ id: docRef.id, ...term });
            });
            
            await batch.commit();
            
            // 4. Manually update local state to trigger an immediate re-render, avoiding a re-fetch.
            setData(newTerms);
          }
        } catch (err) {
          console.error("Error seeding glossary data: ", err);
          // If seeding fails, we don't want to be stuck in a loading state.
        } finally {
          setIsSeeding(false);
        }
      }
    };

    seedDataIfNeeded();
  // This effect should run when loading states change or the user/firestore instances become available.
  }, [firestore, user, isLoading, isUserLoading, glossaryTerms, setData]);


  if (isLoading || isSeeding) {
    return (
        <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading glossary...</p>
            </div>
        </div>
    );
  }
  
  if (error) {
      return <div className="p-8 text-destructive">Error loading glossary: {error.message}</div>
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold font-headline mb-6">Glossary of Legal Terms</h1>
      {glossaryTerms && glossaryTerms.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {glossaryTerms.sort((a, b) => a.term.localeCompare(b.term)).map((term) => (
            <AccordionItem value={term.id} key={term.id}>
              <AccordionTrigger className="text-lg font-semibold font-headline text-left">{term.term}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {term.definition}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <BookMarked className="mx-auto size-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold mt-4">Glossary is Empty</h3>
          <p className="text-muted-foreground mt-2 mb-4">
            There are no terms in the glossary, and they could not be loaded automatically.
          </p>
        </div>
      )}
    </div>
  )
}
