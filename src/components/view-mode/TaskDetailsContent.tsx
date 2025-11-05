import { Task, KnowledgeItem } from '../../types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { ViewKnowledgeDatabaseTab as KnowledgeDatabaseTab } from './KnowledgeDatabaseTab';
import { ViewImagesTab as ImagesTab } from './ImagesTab';
import { extractKnowledgeLinkIds } from '../../utils/knowledgeLinks';
import { extractImageUrls } from '../../utils/imageExtraction';
import { isInstructionsEmpty } from '../../utils/instructions';
import { Info, BookOpen, Image as ImageIcon } from 'lucide-react';

interface ViewTaskDetailsContentProps {
  task: Task;
  knowledgeItems: KnowledgeItem[];
  onKnowledgeLinkClick?: (item: KnowledgeItem) => void;
  onImageClick?: (imageUrl: string) => void;
}

export function ViewTaskDetailsContent({
  task,
  knowledgeItems,
  onKnowledgeLinkClick,
  onImageClick,
}: ViewTaskDetailsContentProps) {
  const taskInstructions = task.instructions || '';

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
        <h2 className="text-2xl font-semibold mb-2 text-white/60 uppercase">
          {task.title || 'Untitled Task'}
        </h2>
        {task.description && (
          <p className="text-base leading-relaxed whitespace-pre-wrap text-white/70">
            {task.description}
          </p>
        )}
      </div>

      {/* Tabs for Instructions, Knowledge Database, and Images */}
      {tabCount > 0 && (
        <Tabs defaultValue={hasInstructions ? "instructions" : (hasKnowledgeLinks ? "knowledge" : "images")} className="w-full">
          <TabsList className={`grid w-full ${gridCols} bg-white/10 text-white/70 !rounded-none`}>
            {hasInstructions && (
              <TabsTrigger value="instructions" className="flex items-center justify-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white !rounded-none">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Instructions</span>
              </TabsTrigger>
            )}
            {hasKnowledgeLinks && (
              <TabsTrigger value="knowledge" className="flex items-center justify-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white !rounded-none">
                <BookOpen className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Knowledge Database ({getAllKnowledgeLinks().length})</span>
                <span className="sm:hidden">({getAllKnowledgeLinks().length})</span>
              </TabsTrigger>
            )}
            {hasImages && (
              <TabsTrigger value="images" className="flex items-center justify-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white !rounded-none">
                <ImageIcon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Images ({imageUrls.length})</span>
                <span className="sm:hidden">({imageUrls.length})</span>
              </TabsTrigger>
            )}
          </TabsList>
          {hasInstructions && (
            <TabsContent value="instructions" className="mt-4">
              <div className="prose prose-sm max-w-none">
                <div 
                  className="instructions-content"
                  dangerouslySetInnerHTML={{ __html: taskInstructions }} 
                  tabIndex={-1}
                  style={{ outline: 'none' }}
                  onClick={(e) => {
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
                    color: #ffffff;
                  }
                  .instructions-content h2 {
                    font-size: 1.5em;
                    font-weight: bold;
                    margin: 0.75em 0;
                    line-height: 1.3;
                    color: #ffffff;
                  }
                  .instructions-content h3 {
                    font-size: 1.17em;
                    font-weight: bold;
                    margin: 0.83em 0;
                    line-height: 1.4;
                    color: #ffffff;
                  }
                  .instructions-content h4 {
                    font-size: 1em;
                    font-weight: bold;
                    margin: 1em 0;
                    line-height: 1.5;
                    color: #ffffff;
                  }
                  .instructions-content h5 {
                    font-size: 0.83em;
                    font-weight: bold;
                    margin: 1.17em 0;
                    line-height: 1.5;
                    color: #ffffff;
                  }
                  .instructions-content h6 {
                    font-size: 0.67em;
                    font-weight: bold;
                    margin: 1.33em 0;
                    line-height: 1.5;
                    color: #ffffff;
                  }
                  .instructions-content p {
                    margin: 0.5em 0;
                    color: rgba(255, 255, 255, 0.7);
                  }
                  .instructions-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0;
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
                    color: #60a5fa;
                    text-decoration: underline;
                    cursor: pointer;
                    pointer-events: auto;
                  }
                  .instructions-content a[data-knowledge-link]:hover {
                    color: #93c5fd;
                    text-decoration: underline;
                  }
                  .instructions-content a:not([data-knowledge-link]) {
                    color: #60a5fa;
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

