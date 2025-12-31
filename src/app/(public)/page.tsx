'use client';

import { UploadCloud, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { useFirebase } from "@/firebase";

export default function Home() {
  const { user, isUserLoading } = useFirebase();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="size-8 text-primary" />
            <span className="text-2xl font-bold font-headline">ClarityLegal</span>
          </Link>
          <Button asChild>
            <Link href={user ? "/dashboard" : "/login"}>
              {isUserLoading ? 'Loading...' : user ? 'Go to App' : 'Login'}
              <ArrowRight className="ml-2"/>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center gap-8 px-4 py-20 text-center md:px-6 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-headline font-extrabold tracking-tight md:text-5xl lg:text-6xl">
              Understand Legal Docs in Minutes, Not Hours.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              ClarityLegal uses AI to translate dense legal jargon into simple,
              clear language. Upload your document and get summaries, explanations,
              and risk assessments instantly.
            </p>
          </div>
          
          <Card className="w-full max-w-xl shadow-lg">
            <CardContent className="p-8">
              <UploadDnd />
            </CardContent>
          </Card>
          
          <p className="text-sm text-muted-foreground">
            Get started by uploading a document or signing in.
          </p>
        </section>

        <section className="bg-secondary/50 py-20">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-3xl font-headline font-bold text-center mb-12">How It Works</h2>
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground mb-4">
                            <span className="font-bold text-xl">1</span>
                        </div>
                        <h3 className="text-xl font-headline font-semibold mb-2">Upload Document</h3>
                        <p className="text-muted-foreground">Securely upload your PDF, DOCX, or text file.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground mb-4">
                            <span className="font-bold text-xl">2</span>
                        </div>
                        <h3 className="text-xl font-headline font-semibold mb-2">AI Analysis</h3>
                        <p className="text-muted-foreground">Our AI provides summaries, explains clauses, and identifies risks.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground mb-4">
                            <span className="font-bold text-xl">3</span>
                        </div>
                        <h3 className="text-xl font-headline font-semibold mb-2">Gain Clarity</h3>
                        <p className="text-muted-foreground">Ask questions and understand your document with confidence.</p>
                    </div>
                </div>
            </div>
        </section>
      </main>

      <footer className="bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-6 md:px-6">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} ClarityLegal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// A mock upload component that navigates to the dashboard
function UploadDnd() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border p-12 text-center">
      <UploadCloud className="size-12 text-muted-foreground" />
      <h3 className="text-xl font-semibold">Drag & drop your file here</h3>
      <p className="text-muted-foreground">or</p>
      <Button asChild>
        <Link href="/dashboard">
          Browse Files &amp; Analyze
        </Link>
      </Button>
      <p className="text-xs text-muted-foreground mt-2">
        Login is required to upload and analyze documents.
      </p>
    </div>
  );
}
