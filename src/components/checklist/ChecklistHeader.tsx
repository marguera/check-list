import { Checklist } from '../../types';
import { Edit, Eye } from 'lucide-react';
import { Button } from '../ui/button';

interface ChecklistHeaderProps {
  checklist: Checklist;
  mode: 'edit' | 'view';
  onModeChange: (mode: 'edit' | 'view') => void;
}

export function ChecklistHeader({ checklist, mode, onModeChange }: ChecklistHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {checklist.title}
          </h1>
          <p className="text-lg text-slate-600">
            {checklist.description}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={mode === 'edit' ? 'default' : 'outline'}
            onClick={() => onModeChange('edit')}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant={mode === 'view' ? 'default' : 'outline'}
            onClick={() => onModeChange('view')}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View
          </Button>
        </div>
      </div>
    </div>
  );
}


