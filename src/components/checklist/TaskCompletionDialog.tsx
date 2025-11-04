import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Task } from '../../types';
import { useState } from 'react';

interface TaskCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onConfirm: () => void;
}

export function TaskCompletionDialog({
  open,
  onOpenChange,
  task,
  onConfirm,
}: TaskCompletionDialogProps) {
  const [confirmed, setConfirmed] = useState(false);

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete Task: {task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Instructions</h3>
            <div
              className="prose prose-sm max-w-none instructions-content"
              dangerouslySetInnerHTML={{ __html: task.instructions || 'No instructions provided.' }}
              tabIndex={-1}
              style={{ outline: 'none' }}
            />
            <style>{`
              .instructions-content {
                outline: none !important;
                border: none !important;
              }
              .instructions-content:focus {
                outline: none !important;
                border: none !important;
              }
              .instructions-content h1 {
                font-size: 2em;
                font-weight: bold;
                margin: 0.67em 0;
                line-height: 1.2;
                color: #0f172a;
              }
              .instructions-content h2 {
                font-size: 1.5em;
                font-weight: bold;
                margin: 0.75em 0;
                line-height: 1.3;
                color: #0f172a;
              }
              .instructions-content h3 {
                font-size: 1.17em;
                font-weight: bold;
                margin: 0.83em 0;
                line-height: 1.4;
                color: #0f172a;
              }
              .instructions-content h4 {
                font-size: 1em;
                font-weight: bold;
                margin: 1em 0;
                line-height: 1.5;
                color: #0f172a;
              }
              .instructions-content h5 {
                font-size: 0.83em;
                font-weight: bold;
                margin: 1.17em 0;
                line-height: 1.5;
                color: #0f172a;
              }
              .instructions-content h6 {
                font-size: 0.67em;
                font-weight: bold;
                margin: 1.33em 0;
                line-height: 1.5;
                color: #0f172a;
              }
              .instructions-content p {
                margin: 0.5em 0;
                color: #334155;
              }
              .instructions-content img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 1em auto;
                border-radius: 0.5rem;
              }
              .instructions-content a[data-knowledge-link] {
                color: #2563eb;
                text-decoration: underline;
                cursor: pointer;
              }
              .instructions-content a:not([data-knowledge-link]) {
                color: #2563eb;
                text-decoration: underline;
              }
              .instructions-content ul,
              .instructions-content ol {
                padding-left: 1.5em;
                margin: 0.5em 0;
                display: block;
                list-style-type: disc;
              }
              .instructions-content ol {
                list-style-type: decimal;
              }
              .instructions-content li {
                margin: 0.25em 0;
                display: list-item;
                list-style-position: outside;
              }
            `}</style>
          </div>

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="confirm-checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded"
            />
            <label
              htmlFor="confirm-checkbox"
              className="text-sm text-slate-700 cursor-pointer"
            >
              I confirm all instructions were followed
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (confirmed) {
                onConfirm();
                setConfirmed(false);
                onOpenChange(false);
              } else {
                alert('Please confirm that all instructions were followed');
              }
            }}
            disabled={!confirmed}
          >
            Confirm Completion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


