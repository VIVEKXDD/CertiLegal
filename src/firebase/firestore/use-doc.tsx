'use client';

import { useState, useEffect } from 'react';
import {
  DocumentReference,
  DocumentData,
  onSnapshot,
  FirestoreError,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: T | null;          // Document data or null if not found.
  isLoading: boolean;      // True if loading.
  error: FirestoreError | Error | null; // Error object or null.
}

/**
 * React hook to subscribe to a single Firestore document in real-time.
 * Handles nullable document references gracefully.
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedDocRef or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *
 * @template T Optional type for the document data. Defaults to any.
 * @param {DocumentReference<DocumentData> | null | undefined} memoizedDocRef - The memoized Firestore DocumentReference. Hook waits if null/undefined.
 * @returns {UseDocResult<T>} Object with data, isLoading, and error state.
 */
export default function useDoc<T = any>(
  memoizedDocRef: (DocumentReference<DocumentData> & {__memo?: boolean}) | null | undefined,
): UseDocResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setData(docSnap.data() as T);
        } else {
          setData(null); // Document does not exist
        }
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);
        
        // trigger global error propagation
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef]);
  
  if(memoizedDocRef && !memoizedDocRef.__memo) {
    throw new Error(memoizedDocRef + ' was not properly memoized using useMemoFirebase');
  }

  return { data, isLoading, error };
}