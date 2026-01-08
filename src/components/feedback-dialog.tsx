'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface FeedbackDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (correctedValue: string, comment: string) => void;
  originalValue: string;
  options: string[];
}

export function FeedbackDialog({ isOpen, onOpenChange, onSubmit, originalValue, options }: FeedbackDialogProps) {
  const [correctedValue, setCorrectedValue] = useState(originalValue);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(correctedValue, comment);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Provide Feedback</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve. Please select the correct document category.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="original-value">Original Prediction</Label>
            <p id="original-value" className="text-sm font-semibold text-muted-foreground p-2 bg-secondary rounded-md">{originalValue}</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="corrected-value">Correct Category</Label>
            <Select value={correctedValue} onValueChange={setCorrectedValue}>
              <SelectTrigger id="corrected-value">
                <SelectValue placeholder="Select the correct category" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide any additional context or notes here..."
            />
          </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Submit Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
