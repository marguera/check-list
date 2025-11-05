import { Task, KnowledgeItem } from '../../types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { InstructionsTab } from './InstructionsTab';
import { KnowledgeDatabaseTab } from './KnowledgeDatabaseTab';
import { ImagesTab } from './ImagesTab';
import { extractKnowledgeLinkIds } from '../../utils/knowledgeLinks';
import { extractImageUrls } from '../../utils/imageExtraction';
import { isInstructionsEmpty } from '../../utils/instructions';

interface TaskDetailsContentProps {
  task: Task;
  knowledgeItems: KnowledgeItem[];
  mode: 'view' | 'edit' | 'completion';
  instructions?: string;
  onInstructionsChange?: (instructions: string) => void;
  onKnowledgeLinkInserted?: (itemId: string) => void;
  onKnowledgeLinkClick?: (item: KnowledgeItem) => void;
  onImageClick?: (imageUrl: string) => void;
}

export function TaskDetailsContent({
  task,
  knowledgeItems,
  mode,
  instructions,
  onInstructionsChange,
  onKnowledgeLinkInserted,
  onKnowledgeLinkClick,
  onImageClick,
}: TaskDetailsContentProps) {
  const taskInstructions = instructions !== undefined ? instructions : (task.instructions || '');
  const isViewMode = mode === 'view' || mode === 'completion';
  const isEditable = mode === 'edit';

  // Get all knowledge links including those from instructions HTML
  const getAllKnowledgeLinks = () => {
    const extractedIds = extractKnowledgeLinkIds(taskInstructions || '');
    const explicitLinks = task.knowledgeDatabaseLinks || [];
    return [...new Set([...explicitLinks, ...extractedIds])];
  };

  // Get all images from instructions HTML
  const getAllImages = () => {
    return extractImageUrls(taskInstructions || '');
  };

  const hasInstructions = !isInstructionsEmpty(taskInstructions);
  const imageUrls = getAllImages();
  const hasImages = imageUrls.length > 0;
  const hasKnowledgeLinks = getAllKnowledgeLinks().length > 0;

  // Determine which tabs to show
  const tabCount = (hasInstructions ? 1 : 0) + (hasKnowledgeLinks ? 1 : 0) + (hasImages ? 1 : 0);
  const gridCols = tabCount === 1 ? 'grid-cols-1' : tabCount === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className="space-y-6 mb-4">
      {/* Title and Description */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {task.title || 'Untitled Task'}
        </h2>
        {task.description && (
          <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
            {task.description}
          </p>
        )}
      </div>

      {/* Tabs for Instructions, Knowledge Database, and Images */}
      {tabCount > 0 && (
        <Tabs defaultValue={hasInstructions ? "instructions" : (hasKnowledgeLinks ? "knowledge" : "images")} className="w-full">
          <TabsList className={`grid w-full ${gridCols}`}>
            {hasInstructions && (
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
            )}
            {hasKnowledgeLinks && (
              <TabsTrigger value="knowledge">
                Knowledge Database ({getAllKnowledgeLinks().length})
              </TabsTrigger>
            )}
            {hasImages && (
              <TabsTrigger value="images">
                Images ({imageUrls.length})
              </TabsTrigger>
            )}
          </TabsList>
          {hasInstructions && (
            <TabsContent value="instructions" className="mt-4">
              {isViewMode ? (
                <div className="prose prose-sm max-w-none">
                  <div 
                    className="instructions-content"
                    dangerouslySetInnerHTML={{ __html: taskInstructions }} 
                    tabIndex={-1}
                    style={{ outline: 'none' }}
                    onClick={(e) => {
                      if (!isViewMode) return;
                      const target = e.target as HTMLElement;
                      
                      // Handle knowledge link clicks
                      const link = target.closest('a[data-knowledge-link]') as HTMLAnchorElement;
                      if (link && onKnowledgeLinkClick) {
                        e.preventDefault();
                        const knowledgeId = link.getAttribute('data-knowledge-id');
                        if (knowledgeId) {
                          const item = knowledgeItems.find(item => item.id === knowledgeId);
                          if (item) {
                            onKnowledgeLinkClick(item);
                          }
                        }
                        return;
                      }
                      
                      // Handle image clicks
                      const img = target.closest('img') as HTMLImageElement;
                      if (img && img.src && onImageClick) {
                        e.preventDefault();
                        onImageClick(img.src);
                      }
                    }}
                  />
                  <style>{`
                    .instructions-content {
                      outline: none !important;
                      border: none !important;
                    }
                    .instructions-content * {
                      outline: none !important;
                      border: none !important;
                    }
                    .instructions-content:focus {
                      outline: none !important;
                      border: none !important;
                    }
                    .instructions-content:focus * {
                      outline: none !important;
                      border: none !important;
                    }
                    .instructions-content a {
                      tabindex: -1;
                    }
                    .instructions-content a:focus {
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
                      border-radius: 0.5rem;
                      display: block;
                      cursor: pointer;
                      transition: opacity 0.2s;
                    }
                    .instructions-content img:hover {
                      opacity: 0.9;
                    }
                    .instructions-content img:not([data-align]) {
                      margin: 1em auto;
                    }
                    .instructions-content img[data-align="left"] {
                      margin: 1em 0;
                    }
                    .instructions-content img[data-align="right"] {
                      margin-left: auto;
                      margin-right: 0;
                      margin-top: 1em;
                      margin-bottom: 1em;
                    }
                    .instructions-content a[data-knowledge-link] {
                      color: #2563eb;
                      text-decoration: underline;
                      cursor: pointer;
                      pointer-events: auto;
                    }
                    .instructions-content a[data-knowledge-link]:hover {
                      color: #1d4ed8;
                      text-decoration: underline;
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
              ) : (
                <InstructionsTab
                  instructions={taskInstructions}
                  onInstructionsChange={onInstructionsChange || (() => {})}
                  knowledgeItems={knowledgeItems}
                  onKnowledgeLinkInserted={onKnowledgeLinkInserted || (() => {})}
                  editable={isEditable}
                  taskId={task.id}
                />
              )}
            </TabsContent>
          )}
          {hasKnowledgeLinks && (
            <TabsContent value="knowledge" className="mt-4">
              <KnowledgeDatabaseTab
                linkedItemIds={task.knowledgeDatabaseLinks || []}
                knowledgeItems={knowledgeItems}
                instructions={taskInstructions}
              />
            </TabsContent>
          )}
          {hasImages && (
            <TabsContent value="images" className="mt-4">
              <ImagesTab imageUrls={imageUrls} />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}

