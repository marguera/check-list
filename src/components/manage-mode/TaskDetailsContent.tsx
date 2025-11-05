import { Task, KnowledgeItem } from '../../types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { InstructionsTab } from './InstructionsTab';
import { ManageKnowledgeDatabaseTab } from './KnowledgeDatabaseTab';
import { ManageImagesTab } from './ImagesTab';
import { extractKnowledgeLinkIds } from '../../utils/knowledgeLinks';
import { extractImageUrls } from '../../utils/imageExtraction';
import { isInstructionsEmpty } from '../../utils/instructions';
import { Info, BookOpen, Image as ImageIcon } from 'lucide-react';

interface ManageTaskDetailsContentProps {
  task: Task;
  knowledgeItems: KnowledgeItem[];
  instructions?: string;
  onInstructionsChange?: (instructions: string) => void;
  onKnowledgeLinkInserted?: (itemId: string) => void;
  taskId?: string;
}

export function ManageTaskDetailsContent({
  task,
  knowledgeItems,
  instructions,
  onInstructionsChange,
  onKnowledgeLinkInserted,
  taskId,
}: ManageTaskDetailsContentProps) {
  const taskInstructions = instructions !== undefined ? instructions : (task.instructions || '');

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
        <h2 className="text-2xl font-semibold mb-2 text-slate-900">
          {task.title || 'Untitled Task'}
        </h2>
        {task.description && (
          <p className="text-base leading-relaxed whitespace-pre-wrap text-slate-700">
            {task.description}
          </p>
        )}
      </div>

      {/* Tabs for Instructions, Knowledge Database, and Images */}
      {tabCount > 0 && (
        <Tabs defaultValue={hasInstructions ? "instructions" : (hasKnowledgeLinks ? "knowledge" : "images")} className="w-full">
          <TabsList className={`grid w-full ${gridCols}`}>
            {hasInstructions && (
              <TabsTrigger value="instructions" className="flex items-center justify-center gap-2">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Instructions</span>
              </TabsTrigger>
            )}
            {hasKnowledgeLinks && (
              <TabsTrigger value="knowledge" className="flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Knowledge Database ({getAllKnowledgeLinks().length})</span>
                <span className="sm:hidden">({getAllKnowledgeLinks().length})</span>
              </TabsTrigger>
            )}
            {hasImages && (
              <TabsTrigger value="images" className="flex items-center justify-center gap-2">
                <ImageIcon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Images ({imageUrls.length})</span>
                <span className="sm:hidden">({imageUrls.length})</span>
              </TabsTrigger>
            )}
          </TabsList>
          {hasInstructions && (
            <TabsContent value="instructions" className="mt-4">
              <InstructionsTab
                instructions={taskInstructions}
                onInstructionsChange={onInstructionsChange || (() => {})}
                knowledgeItems={knowledgeItems}
                onKnowledgeLinkInserted={onKnowledgeLinkInserted || (() => {})}
                editable={true}
                taskId={taskId || task.id}
              />
            </TabsContent>
          )}
          {hasKnowledgeLinks && (
            <TabsContent value="knowledge" className="mt-4">
              <ManageKnowledgeDatabaseTab
                linkedItemIds={task.knowledgeDatabaseLinks || []}
                knowledgeItems={knowledgeItems}
                instructions={taskInstructions}
              />
            </TabsContent>
          )}
          {hasImages && (
            <TabsContent value="images" className="mt-4">
              <ManageImagesTab imageUrls={imageUrls} />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}

