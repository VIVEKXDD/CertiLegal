'use client';

import { useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Required for pdfjs-dist
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


interface UploadDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDocumentAdd: (document: { title: string; description: string; content: string }) => void;
}

export default function UploadDialog({ isOpen, onOpenChange, onDocumentAdd }: UploadDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const resetState = () => {
    setTitle('');
    setDescription('');
    setContent('');
    setFileName('');
    setIsParsing(false);
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setIsParsing(true);
      
      if (!title) {
        // Pre-fill title from filename without extension
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
      
      const reader = new FileReader();

      try {
        if (file.type === 'application/pdf') {
            reader.onload = async (e) => {
                const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
                const pdf = await pdfjs.getDocument(typedArray).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\\n\\n';
                }
                setContent(fullText);
                setIsParsing(false);
            };
            reader.readAsArrayBuffer(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            reader.onload = async (e) => {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                const result = await mammoth.extractRawText({ arrayBuffer });
                setContent(result.value.replace(/\n/g, '\\n\\n'));
                setIsParsing(false);
            };
            reader.readAsArrayBuffer(file);
        } else { // Assume plain text for others
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setContent(text.replace(/\n/g, '\\n\\n'));
                setIsParsing(false);
            };
            reader.readAsText(file);
        }
      } catch (error) {
          console.error("Error parsing file:", error);
          setContent("Error parsing file. Please check the console for details.");
          setIsParsing(false);
      }
    }
  };

  const handleSubmit = () => {
    if (title && content) {
      onDocumentAdd({ title, description, content });
      resetState();
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload New Document</DialogTitle>
          <DialogDescription>
            Add a new document by uploading a file or pasting the text content.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Employment Contract"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="A short description of the document"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="file-upload">Upload File (.txt, .pdf, .docx)</Label>
            <div className="flex items-center gap-2">
                <Button asChild variant="outline" className="flex-1">
                    <label htmlFor="file-upload" className="cursor-pointer">
                        {fileName ? "Change File" : "Browse File"}
                    </label>
                </Button>
                <Input id="file-upload" type="file" accept=".txt,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} className="hidden" />
                {fileName && <p className="text-sm text-muted-foreground truncate flex-1">{fileName}</p>}
            </div>
            
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Or Paste Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isParsing ? "Parsing file..." : "Paste the full text of your document here."}
              className="min-h-[150px]"
              disabled={isParsing}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!title || !content || isParsing}>
            {isParsing ? 'Parsing...' : 'Add Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
