import { useState, useEffect, useRef } from 'react';
import { Project, KnowledgeItem, Task } from '../../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Upload, Loader2, FileText, Copy } from 'lucide-react';
import { extractFromZip, processHtmlContent } from '../../../utils/zipProcessing';
import { parseWorkflowImport, convertParsedWorkflowToTasks } from '../../../utils/workflowImport';
import { compressImageMap } from '../../../utils/imageCompression';

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
  const [fileType, setFileType] = useState<'zip' | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [yamlText, setYamlText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [imageMap, setImageMap] = useState<Map<string, string>>(new Map());
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

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
      setFileType(null);
      setExtractedText('');
      setYamlText('');
      setImageMap(new Map());
      setImportErrors([]);
      setImportWarnings([]);
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

    // Determine file type - only ZIP supported
    let detectedType: 'zip' | null = null;
    if (
      file.type === 'application/zip' ||
      file.type === 'application/x-zip-compressed' ||
      file.name.toLowerCase().endsWith('.zip')
    ) {
      detectedType = 'zip';
    } else {
      alert('Please select a valid ZIP file');
      return;
    }

    setSourceFile(file);
    setFileType(detectedType);
    setProcessing(true);
    setImportErrors([]);
    setImportWarnings([]);

    try {
      if (detectedType === 'zip') {
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
      }
    } catch (error: any) {
      setImportErrors([`Failed to process ZIP file: ${error.message}`]);
      setSourceFile(null);
      setFileType(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleYamlChange = (text: string) => {
    setYamlText(text);
    setImportErrors([]);
    setImportWarnings([]);

    // Try to parse and validate
    if (text.trim()) {
      try {
        const result = parseWorkflowImport(text, knowledgeItems, imageMap);
        if (result.errors.length > 0) {
          setImportErrors(result.errors);
        }
        if (result.warnings.length > 0) {
          setImportWarnings(result.warnings);
        }
        if (result.workflow.title) {
          setTitle(result.workflow.title);
          setDescription(result.workflow.description);
        }
      } catch (error) {
        // Validation errors are already set
      }
    }
  };

  const generateFullPrompt = (): string => {
    const promptTemplate = `You are a workflow conversion assistant. Convert the following text (extracted from a ZIP file) into a structured YAML workflow format.

If the text contains image placeholders like [IMAGE:image-1], preserve them exactly as they appear in the instructions field.

Output format (YAML):

\`\`\`yaml
workflow:
  title: "Workflow Title"
  description: "Optional workflow description"

tasks:
  - step: 1
    title: "Task Title"
    description: "Task description"
    importance: "high"  # optional: "low" | "high"
    image: "image-1"  # optional: reference to an image placeholder (e.g., "image-1", "image-2") that exists in instructions. This will be used as the task list image.
    instructions: |
      <p>HTML content for instructions</p>
      <p>Reference images using: [IMAGE:image-1] or [IMAGE:image-2]</p>
\`\`\`

## Format Rules:

1. **Workflow**:
   - \`title\` (required): The workflow title
   - \`description\` (optional): Brief description of the workflow

2. **Tasks**:
   - Each task must have a \`step\` number (sequential: 1, 2, 3, ...)
   - \`title\` (required): Task title
   - \`description\` (optional): Brief task description
   - \`importance\` (optional): "low" or "high"
   - \`image\` (optional): Reference to an image placeholder (e.g., "image-1", "image-2") that exists in the instructions. This image will be displayed in the task list. Use the placeholder name that appears in the instructions (e.g., [IMAGE:image-1] means use "image-1"). If not set, no image will show in the task list.
   - \`instructions\` (required): HTML-formatted instructions. Use HTML tags like <p>, <ul>, <ol>, <li>, <strong>, <em>, etc.
   - If the input text contains image placeholders like \`[IMAGE:image-1]\`, preserve them exactly in the instructions

3. **HTML Instructions**:
   - Use proper HTML tags
   - Use semantic HTML: <p> for paragraphs, <ul>/<ol> for lists, <strong> for emphasis, etc.
   - If the input contains image placeholders like \`[IMAGE:image-1]\`, preserve them exactly as they appear

## Instructions:

1. Analyze the input text and identify distinct tasks/steps
2. Extract workflow title and description from the content
3. For each task, create a structured entry with:
   - Step number
   - Title (concise, action-oriented)
   - Description (brief summary)
   - Instructions (detailed HTML-formatted content)
4. If the input contains image placeholders like [IMAGE:image-1], preserve them exactly in the instructions
5. Output only valid YAML, ready to be parsed

## Input Text:

${extractedText || '[PASTE THE EXTRACTED TEXT HERE (from ZIP), INCLUDING IMAGE PLACEHOLDERS]'}`;
    
    return promptTemplate;
  };

  const handleCopyPrompt = () => {
    const prompt = generateFullPrompt();
    navigator.clipboard.writeText(prompt).then(() => {
      // Show feedback (you could use a toast notification here)
      alert('Prompt copied to clipboard!');
    }).catch(() => {
      // Fallback: select text in textarea
      if (promptTextareaRef.current) {
        promptTextareaRef.current.select();
        document.execCommand('copy');
        alert('Prompt copied to clipboard!');
      }
    });
  };

  const handleImport = () => {
    if (!yamlText.trim()) {
      setImportErrors(['Please paste the YAML workflow format']);
      return;
    }

    if (!projectId) {
      setImportErrors(['Project ID is required for import']);
      return;
    }

    try {
      // Debug: log imageMap state before parsing
      console.log('Importing with imageMap:', {
        size: imageMap.size,
        keys: Array.from(imageMap.keys()),
        sampleKey: imageMap.size > 0 ? Array.from(imageMap.keys())[0] : null,
      });
      
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

      // Show warnings if any
      if (result.warnings.length > 0) {
        setImportWarnings(result.warnings);
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

      {/* Prompt Dialog */}
      <Dialog open={promptDialogOpen} onOpenChange={setPromptDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1F1F20] text-white border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white uppercase tracking-wide">
              LLM Prompt Template
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Copy this prompt and use it with your LLM to convert the extracted text to workflow format
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-end">
              <Button
                onClick={handleCopyPrompt}
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Prompt
              </Button>
            </div>
            <textarea
              ref={promptTextareaRef}
              value={generateFullPrompt()}
              readOnly
              rows={20}
              className="w-full px-3 py-2 border border-white/20 rounded-md bg-[#19191A] text-white/80 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none font-mono text-xs"
            />
            <p className="text-xs text-white/50">
              The extracted text has been automatically inserted into the prompt. Copy the entire prompt above and paste it into your LLM.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-white/20">
            <Button
              variant="default"
              onClick={() => setPromptDialogOpen(false)}
              className="bg-transparent border border-white/20 text-white hover:bg-white/10"
            >
              Close
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
                  disabled={processing}
                  className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {sourceFile ? `Change ZIP` : 'Select ZIP'}
                </Button>
                {sourceFile && (
                  <span className="text-sm text-white/70">{sourceFile.name}</span>
                )}
                {processing && (
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing {fileType?.toUpperCase()}...
                  </div>
                )}
              </div>
              <p className="text-xs text-white/50 mt-2">
                Upload a ZIP archive containing HTML files and images
              </p>
            </div>

            {/* Extracted Text */}
            {extractedText && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold uppercase tracking-wide text-white/70">
                    Extracted Text (for LLM conversion)
                  </label>
                  <Button
                    onClick={() => setPromptDialogOpen(true)}
                    size="sm"
                    className="bg-white/10 border border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Prompt
                  </Button>
                </div>
                <textarea
                  value={extractedText}
                  readOnly
                  rows={8}
                  className="w-full px-3 py-2 border border-white/20 rounded-md bg-[#19191A] text-white/80 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none font-mono text-xs"
                  placeholder="Text will appear here after upload"
                />
                <p className="text-xs text-white/50 mt-1">
                  Click "View Prompt" to see the full LLM prompt with this text inserted
                </p>
              </div>
            )}

            {/* YAML Input */}
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wide text-white/70 mb-2">
                Paste YAML Workflow Format
              </label>
              <textarea
                value={yamlText}
                onChange={(e) => handleYamlChange(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-white/20 rounded-md bg-[#19191A] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none font-mono text-xs"
                placeholder="Paste the YAML output from your LLM here..."
              />
            </div>

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

            {/* Preview */}
            {yamlText && title && importErrors.length === 0 && (
              <div className="bg-white/5 border border-white/10 rounded-md p-3">
                <p className="text-sm font-semibold text-white/70 mb-2">Preview:</p>
                <p className="text-sm text-white/80">
                  <strong>Title:</strong> {title}
                </p>
                {description && (
                  <p className="text-sm text-white/80 mt-1">
                    <strong>Description:</strong> {description}
                  </p>
                )}
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
              disabled={!yamlText.trim() || importErrors.length > 0 || processing}
              className="bg-white text-[#19191A] hover:bg-white/90 disabled:opacity-50"
            >
              Import Workflow
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* Prompt Dialog */}
    <Dialog open={promptDialogOpen} onOpenChange={setPromptDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1F1F20] text-white border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white uppercase tracking-wide">
            LLM Prompt Template
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Copy this prompt and use it with your LLM to convert the extracted text to workflow format
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-end">
            <Button
              onClick={handleCopyPrompt}
              className="bg-white/10 border border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Prompt
            </Button>
          </div>
          <textarea
            ref={promptTextareaRef}
            value={generateFullPrompt()}
            readOnly
            rows={20}
            className="w-full px-3 py-2 border border-white/20 rounded-md bg-[#19191A] text-white/80 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none font-mono text-xs"
          />
          <p className="text-xs text-white/50">
            The extracted text has been automatically inserted into the prompt. Copy the entire prompt above and paste it into your LLM.
          </p>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-white/20">
          <Button
            variant="default"
            onClick={() => setPromptDialogOpen(false)}
            className="bg-transparent border border-white/20 text-white hover:bg-white/10"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

