import { useState, useEffect, useRef } from 'react';
import { Project, KnowledgeItem, Task } from '../../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { extractFromZip, processHtmlContent } from '../../../utils/zipProcessing';
import { parseWorkflowImport, convertParsedWorkflowToTasks } from '../../../utils/workflowImport';
import { compressImageMap } from '../../../utils/imageCompression';
import { convertTextToWorkflowYAML } from '../../../utils/llmService';

interface WorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow: Project['workflows'][0] | null;
  onSave: (workflow: Partial<Project['workflows'][0]>) => void;
  mode: 'add' | 'edit';
  knowledgeItems?: KnowledgeItem[];
  projectId?: string;
  onImportWorkflow?: (workflow: Partial<Project['workflows'][0]>, tasks: Task[]) => void;
}

export function WorkflowDialog({
  open,
  onOpenChange,
  workflow,
  onSave,
  mode,
  knowledgeItems = [],
  projectId,
  onImportWorkflow,
}: WorkflowDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [importMode, setImportMode] = useState<'create' | 'import'>('create');
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [yamlText, setYamlText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [converting, setConverting] = useState(false);
  const [imageMap, setImageMap] = useState<Map<string, string>>(new Map());
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [parsedWorkflow, setParsedWorkflow] = useState<{ title: string; description: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (workflow) {
        setTitle(workflow.title);
        setDescription(workflow.description);
        setImportMode('create');
      } else {
        setTitle('');
        setDescription('');
        setImportMode('create');
      }
      // Reset import state
      setSourceFile(null);
      setExtractedText('');
      setYamlText('');
      setImageMap(new Map());
      setImportErrors([]);
      setImportWarnings([]);
      setParsedWorkflow(null);
    }
  }, [open, workflow]);

  const handleSave = () => {
    if (!title.trim()) {
      return;
    }
    onSave({ title, description });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate ZIP file
    if (
      !(file.type === 'application/zip' ||
        file.type === 'application/x-zip-compressed' ||
        file.name.toLowerCase().endsWith('.zip'))
    ) {
      alert('Please select a valid ZIP file');
      return;
    }

    setSourceFile(file);
    setProcessing(true);
    setImportErrors([]);
    setImportWarnings([]);

    try {
      // Extract HTML and images from ZIP
      const { htmlContent, images } = await extractFromZip(file);
      
      // Process HTML to replace image references with placeholders
      const { text, imagePlaceholders } = processHtmlContent(htmlContent, images);
      
      // Create a map of placeholder -> image data URL
      const placeholderMap = new Map<string, string>();
      for (const [placeholder, imagePath] of imagePlaceholders.entries()) {
        const imageData = images.get(imagePath);
        if (imageData) {
          placeholderMap.set(placeholder, imageData);
        }
      }
      
      // Compress images to reduce storage size
      let compressedMap = placeholderMap;
      if (placeholderMap.size > 0) {
        console.log(`Compressing ${placeholderMap.size} images from ZIP...`);
        compressedMap = await compressImageMap(placeholderMap);
        const totalSize = Array.from(compressedMap.values())
          .reduce((sum, dataUrl) => sum + (dataUrl.length * 3 / 4), 0) / (1024 * 1024);
        console.log(`Total compressed image size: ${totalSize.toFixed(2)}MB`);
      }
      
      setImageMap(compressedMap);
      setExtractedText(text);
      
      if (compressedMap.size === 0) {
        setImportWarnings(['No images found in ZIP archive. Text extraction will continue without images.']);
      } else {
        setImportWarnings([]);
      }
    } catch (error: any) {
      setImportErrors([`Failed to process ZIP file: ${error.message}`]);
      setSourceFile(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleConvert = async () => {
    if (!extractedText.trim()) {
      setImportErrors(['No extracted text available. Please upload a ZIP file first.']);
      return;
    }

    setConverting(true);
    setImportErrors([]);
    setImportWarnings([]);

    try {
      const yamlResult = await convertTextToWorkflowYAML(extractedText);
      setYamlText(yamlResult);
      
      // Automatically validate and parse
      const result = parseWorkflowImport(yamlResult, knowledgeItems, imageMap);
      if (result.errors.length > 0) {
        setImportErrors(result.errors);
      }
      if (result.warnings.length > 0) {
        setImportWarnings(result.warnings);
      }
      if (result.workflow.title) {
        setTitle(result.workflow.title);
        setDescription(result.workflow.description);
        setParsedWorkflow({
          title: result.workflow.title,
          description: result.workflow.description,
        });
      }
    } catch (error: any) {
      setImportErrors([`Conversion failed: ${error.message || 'Unknown error'}`]);
    } finally {
      setConverting(false);
    }
  };

  const handleImport = () => {
    if (!yamlText.trim()) {
      setImportErrors(['No workflow data to import. Please upload a ZIP file first.']);
      return;
    }

    if (!projectId) {
      setImportErrors(['Project ID is required for import']);
      return;
    }

    if (importErrors.length > 0) {
      return; // Don't import if there are errors
    }

    try {
      const result = parseWorkflowImport(yamlText, knowledgeItems, imageMap);
      
      if (result.errors.length > 0) {
        setImportErrors(result.errors);
        return;
      }

      if (!result.workflow.title) {
        setImportErrors(['Workflow title is required']);
        return;
      }

      // Convert to tasks
      const tempWorkflowId = `temp-${Date.now()}`;
      const tasks = convertParsedWorkflowToTasks(result.workflow, tempWorkflowId, imageMap);

      if (onImportWorkflow) {
        onImportWorkflow(
          {
            title: result.workflow.title,
            description: result.workflow.description,
          },
          tasks
        );
      } else {
        // Fallback: create workflow then update with tasks
        onSave({
          title: result.workflow.title,
          description: result.workflow.description,
          tasks,
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      setImportErrors([`Import failed: ${error.message}`]);
    }
  };

  if (mode === 'edit') {
    // Edit mode: show simple form
    return (
      <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl bg-[#1F1F20] text-white border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white uppercase tracking-wide">
              Edit Workflow
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Edit the workflow details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wide text-white/70 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-white/20 rounded-md bg-[#19191A] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
                placeholder="Enter workflow title"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wide text-white/70 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-white/20 rounded-md bg-[#19191A] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
                placeholder="Enter workflow description"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-white/20">
            <Button
              variant="default"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim()}
              className="bg-white text-[#19191A] hover:bg-white/90 disabled:opacity-50"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      </>
    );
  }

  // Add mode: show create or import options
  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1F1F20] text-white border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white uppercase tracking-wide">
            Add Workflow
          </DialogTitle>
              <DialogDescription className="text-white/70">
                Create a new workflow or import from ZIP
              </DialogDescription>
        </DialogHeader>

        {/* Mode Tabs */}
        <div className="flex gap-2 border-b border-white/20 mb-4">
          <button
            onClick={() => setImportMode('create')}
            className={`px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
              importMode === 'create'
                ? 'text-white border-b-2 border-white'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            Create Manually
          </button>
          <button
            onClick={() => setImportMode('import')}
            className={`px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
              importMode === 'import'
                ? 'text-white border-b-2 border-white'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            Import from ZIP
          </button>
        </div>

        {importMode === 'create' ? (
          // Create mode
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wide text-white/70 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-white/20 rounded-md bg-[#19191A] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
                placeholder="Enter workflow title"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wide text-white/70 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-white/20 rounded-md bg-[#19191A] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
                placeholder="Enter workflow description"
              />
            </div>
          </div>
        ) : (
          // Import mode
          <div className="space-y-4 py-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wide text-white/70 mb-2">
                Upload ZIP
              </label>
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={processing || converting}
                  className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {sourceFile ? `Change ZIP` : 'Select ZIP'}
                </Button>
                {sourceFile && (
                  <span className="text-sm text-white/70">{sourceFile.name}</span>
                )}
                {(processing || converting) && (
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {processing ? 'Processing ZIP...' : 'Converting to workflow...'}
                  </div>
                )}
              </div>
              <p className="text-xs text-white/50 mt-2">
                Upload a ZIP archive containing HTML files and images
              </p>
            </div>

            {/* Convert Button - Show after file is processed but before conversion */}
            {extractedText && !parsedWorkflow && !converting && (
              <div>
                <Button
                  onClick={handleConvert}
                  disabled={processing || converting}
                  className="bg-white text-[#19191A] hover:bg-white/90 disabled:opacity-50 w-full"
                >
                  Convert to Workflow
                </Button>
                <p className="text-xs text-white/50 mt-2 text-center">
                  Click to convert the extracted content to a workflow format
                </p>
              </div>
            )}

            {/* Preview */}
            {parsedWorkflow && importErrors.length === 0 && (
              <div className="bg-white/5 border border-white/10 rounded-md p-3">
                <p className="text-sm font-semibold text-white/70 mb-2">Ready to Import:</p>
                <p className="text-sm text-white/80">
                  <strong>Title:</strong> {parsedWorkflow.title}
                </p>
                {parsedWorkflow.description && (
                  <p className="text-sm text-white/80 mt-1">
                    <strong>Description:</strong> {parsedWorkflow.description}
                  </p>
                )}
              </div>
            )}

            {/* Errors */}
            {importErrors.length > 0 && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-md p-3">
                <p className="text-sm font-semibold text-red-400 mb-1">Errors:</p>
                <ul className="text-xs text-red-300 list-disc list-inside">
                  {importErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {importWarnings.length > 0 && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-md p-3">
                <p className="text-sm font-semibold text-yellow-400 mb-1">Warnings:</p>
                <ul className="text-xs text-yellow-300 list-disc list-inside">
                  {importWarnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-white/20">
          <Button
            variant="default"
            onClick={() => onOpenChange(false)}
            className="bg-transparent border border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          {importMode === 'create' ? (
            <Button
              onClick={handleSave}
              disabled={!title.trim()}
              className="bg-white text-[#19191A] hover:bg-white/90 disabled:opacity-50"
            >
              Add
            </Button>
          ) : (
            <Button
              onClick={handleImport}
              disabled={!parsedWorkflow || importErrors.length > 0 || processing || converting}
              className="bg-white text-[#19191A] hover:bg-white/90 disabled:opacity-50"
            >
              Import Workflow
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>

    </>
  );
}

