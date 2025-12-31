'use client';

import { useState, useRef, useEffect } from 'react';
import { getRiskAssessment } from '@/lib/actions';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Send, User, Bot, Loader2, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  content: string | { assessment: string; suggestions: string };
}

export default function AiRiskAssessment({ documentText }: { documentText: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

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
        const userInput = formData.get('userInput') as string;

        if (!userInput.trim()) return;

        form.reset();
        setMessages(prev => [...prev, { role: 'user', content: userInput }]);
        setIsLoading(true);
        setError(null);

        const result = await getRiskAssessment({ documentText, userInput });
        
        if ('error' in result) {
            setError(result.error);
            setMessages(prev => [...prev, { role: 'bot', content: `Error: ${result.error}` }]);
        } else {
            setMessages(prev => [...prev, { role: 'bot', content: { assessment: result.riskAssessment, suggestions: result.riskSuggestions } }]);
        }
        setIsLoading(false);
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline">Risk Assessment</CardTitle>
                <CardDescription>Identify potential risks and get suggestions. Start by stating your concerns.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.length === 0 && !isLoading && (
                            <div className="text-center text-muted-foreground p-8">
                                <p>No analysis performed yet.</p>
                                <p className="text-sm">e.g., &quot;I'm worried about the termination clause.&quot;</p>
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <div key={index} className={cn(
                                'flex items-start gap-3 w-full',
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            )}>
                                {message.role === 'bot' && <div className="p-2 rounded-full bg-destructive/10 text-destructive flex-shrink-0"><ShieldAlert className="size-4" /></div>}
                                <div className={cn(
                                    'p-3 rounded-lg max-w-2xl prose prose-sm',
                                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'
                                )}>
                                    {typeof message.content === 'string' ? (
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold !mt-0 !mb-2">Risk Assessment</h4>
                                                <p className="text-sm whitespace-pre-wrap">{message.content.assessment}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold !mb-2">Suggestions</h4>
                                                <p className="text-sm whitespace-pre-wrap">{message.content.suggestions}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {message.role === 'user' && <div className="p-2 rounded-full bg-muted flex-shrink-0"><User className="size-4" /></div>}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3 justify-start">
                                <div className="p-2 rounded-full bg-destructive/10 text-destructive flex-shrink-0"><ShieldAlert className="size-4" /></div>
                                <div className="p-3 rounded-lg bg-background flex items-center">
                                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                </div>
                            </div>
                        )}
                        {error && !isLoading && (
                            <Alert variant="destructive" className="mt-4">
                                <Terminal className="h-4 w-4" />
                                <AlertTitle>Analysis Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter>
                 <form onSubmit={handleFormSubmit} className="flex w-full items-center space-x-2">
                    <Input id="userInput" name="userInput" placeholder="What are your main concerns?" autoComplete="off" disabled={isLoading} />
                    <Button type="submit" size="icon" disabled={isLoading}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
