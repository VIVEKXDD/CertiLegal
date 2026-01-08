
'use client';

import React from 'react';
import { UploadCloud, ArrowRight, FileText, Shield, Search, ListTree, MessagesSquare, BarChart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { useFirebase } from "@/firebase";

const features = [
    {
        icon: <FileText />,
        title: "AI-Powered Summaries",
        description: "Get concise, easy-to-read summaries of long legal documents, highlighting key terms and obligations.",
    },
    {
        icon: <Shield />,
        title: "Risk Assessment",
        description: "Identify potential risks, unfavorable clauses, and ambiguous language that could impact you.",
    },
    {
        icon: <ListTree />,
        title: "Structured Data Extraction",
        description: "Automatically pull out key entities like parties, dates, monetary amounts, and jurisdictions.",
    },
    {
        icon: <Search />,
        title: "Semantic Search",
        description: "Search for concepts and clauses across all your documents using natural language.",
    },
    {
        icon: <MessagesSquare />,
        title: "Interactive Q&A",
        description: "Ask specific questions about your document and get answers based on relevant clauses.",
    },
    {
        icon: <BarChart />,
        title: "Dual-ML Classification",
        description: "Compare document classifications from GenAI and a custom-trained classical model.",
    }
]

export default function Home() {
  const { user, isUserLoading } = useFirebase();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="size-8 text-primary" />
            <span className="text-2xl font-bold font-headline">ClarityLegal</span>
          </Link>
          <Button asChild>
            <Link href={user ? "/dashboard" : "/login"}>
              {isUserLoading ? 'Loading...' : user ? 'Go to Dashboard' : 'Login / Sign Up'}
              {!isUserLoading && <ArrowRight className="ml-2"/>}
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center gap-8 px-4 py-24 text-center md:px-6 md:py-32">
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
          
          <div className="flex flex-col sm:flex-row gap-4">
             <Button asChild size="lg">
                <Link href={user ? "/dashboard" : "/login"}>
                  Get Started for Free
                  <ArrowRight className="ml-2"/>
                </Link>
              </Button>
          </div>
        </section>
        
        <section id="features" className="container mx-auto px-4 md:px-6 py-20">
            <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-3xl font-headline font-bold">A Production-Grade Legal Intelligence System</h2>
                <p className="mt-4 text-muted-foreground">Go beyond a simple assistant. ClarityLegal offers a suite of integrated ML features to provide deep insights.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, i) => (
                    <Card key={i} className="bg-card/50 hover:border-primary/50 transition-colors">
                        <CardHeader>
                             <div className="mb-3 size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                {React.cloneElement(feature.icon, {className: "size-6"})}
                             </div>
                            <CardTitle className="font-headline">{feature.title}</CardTitle>
                            <CardDescription>{feature.description}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </section>

        <section className="bg-secondary/50 py-20">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-3xl font-headline font-bold text-center mb-12">How It Works</h2>
                <div className="grid gap-8 md:grid-cols-3">
                    <Card className="text-center">
                        <CardHeader>
                             <div className="mx-auto flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground mb-4 font-bold text-xl">1</div>
                            <CardTitle className="font-headline font-semibold">Upload Securely</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-muted-foreground">Drag and drop or upload your PDF, DOCX, or text file. Your data is encrypted and secure.</p>
                        </CardContent>
                    </Card>
                     <Card className="text-center">
                        <CardHeader>
                             <div className="mx-auto flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground mb-4 font-bold text-xl">2</div>
                            <CardTitle className="font-headline font-semibold">AI Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Our system provides summaries, explains clauses, extracts entities, and identifies risks in seconds.</p>
                        </CardContent>
                    </Card>
                     <Card className="text-center">
                        <CardHeader>
                             <div className="mx-auto flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground mb-4 font-bold text-xl">3</div>
                            <CardTitle className="font-headline font-semibold">Gain Clarity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Interact with your document, ask questions, and understand every detail with confidence.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
      </main>

      <footer className="bg-background border-t">
        <div className="container mx-auto flex items-center justify-between px-4 py-6 md:px-6">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} ClarityLegal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
