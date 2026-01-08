'use client';

import { useState, useRef, useEffect } from 'react';
import { getAnswer } from '@/lib/actions';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Send, User, Bot, Loader2, BookCopy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';
import { useParams } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Message {
  role: 'user' | 'bot';
  content: string;
  context?: string[];
}

export default function AiChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { user } = useFirebase();
    const params = useParams();
    const docId = params.docId as string;

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages, isLoading]);

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const question = formData.get('question') as string;

        if (!question.trim() || !user) return;

        form.reset();
        setMessages(prev => [...prev, { role: 'user', content: question }]);
        setIsLoading(true);

        const result = await getAnswer({ documentId: docId, userId: user.uid, question });
        
        if ('error' in result) {
            setMessages(prev => [...prev, { role: 'bot', content: `Error: ${result.error}` }]);
        } else {
            setMessages(prev => [...prev, { role: 'bot', content: result.answer, context: result.context }]);
        }
        setIsLoading(false);
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline">Interactive Q&amp;A</CardTitle>
                <CardDescription>Ask any question about the document. The AI will use semantic search to find relevant clauses first.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground p-8">
                                <p>No questions asked yet.</p>
                                <p className="text-sm">Try asking: &quot;What is the term of this agreement?&quot;</p>
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <div key={index} className={cn(
                                'flex items-start gap-3 w-full',
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            )}>
                                {message.role === 'bot' && <div className="p-2 rounded-full bg-primary/20 text-primary flex-shrink-0"><Bot className="size-4" /></div>}
                                <div className={cn(
                                    'p-3 rounded-lg max-w-xl prose prose-sm',
                                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'
                                )}>
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    {message.context && message.context.length > 0 && (
                                        <Accordion type="single" collapsible className="w-full mt-4">
                                            <AccordionItem value="context">
                                                <AccordionTrigger className="text-xs text-muted-foreground hover:no-underline">
                                                    <div className="flex items-center gap-2">
                                                        <BookCopy className="size-3" />
                                                        Show Context ({message.context.length} chunks)
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                                    {message.context.map((chunk, i) => (
                                                        <blockquote key={i} className="text-xs border-l-2 pl-2 italic text-muted-foreground">
                                                            {chunk}
                                                        </blockquote>
                                                    ))}
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    )}
                                </div>
                                {message.role === 'user' && <div className="p-2 rounded-full bg-muted flex-shrink-0"><User className="size-4" /></div>}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3 justify-start">
                                <div className="p-2 rounded-full bg-primary/20 text-primary flex-shrink-0"><Bot className="size-4" /></div>
                                <div className="p-3 rounded-lg bg-background flex items-center">
                                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter>
                 <form onSubmit={handleFormSubmit} className="flex w-full items-center space-x-2">
                    <Input id="question" name="question" placeholder="Type your question..." autoComplete="off" disabled={isLoading} />
                    <Button type="submit" size="icon" disabled={isLoading}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
