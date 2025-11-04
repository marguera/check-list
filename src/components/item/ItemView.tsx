import { useState, useEffect } from 'react';
import { Checklist } from '../../types';
import { Button } from '../ui/button';
import { Save } from 'lucide-react';

interface ItemViewProps {
  checklist: Checklist;
  onUpdate: (title: string, description: string) => void;
}

export function ItemView({ checklist, onUpdate }: ItemViewProps) {
  const [title, setTitle] = useState(checklist.title);
  const [description, setDescription] = useState(checklist.description);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTitle(checklist.title);
    setDescription(checklist.description);
    setHasChanges(false);
  }, [checklist]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setHasChanges(value !== checklist.title || description !== checklist.description);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setHasChanges(title !== checklist.title || value !== checklist.description);
  };

  const handleSave = () => {
    if (title.trim()) {
      onUpdate(title.trim(), description.trim());
      setHasChanges(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Checklist Item</h1>
          <p className="text-slate-600">
            Edit the checklist title and description
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || !title.trim()}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      <div className="space-y-6 bg-white border border-slate-200 rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-lg"
            placeholder="Enter checklist title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none"
            placeholder="Enter checklist description"
          />
        </div>
      </div>
    </div>
  );
}

