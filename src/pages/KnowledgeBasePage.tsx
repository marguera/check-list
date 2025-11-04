import { useProjects } from '../hooks/useProjects';
import { KnowledgeBaseView } from '../components/knowledge/KnowledgeBaseView';

export function KnowledgeBasePage() {
  const {
    knowledgeItems,
    addKnowledgeItem,
    updateKnowledgeItem,
    deleteKnowledgeItem,
  } = useProjects();

  return (
    <KnowledgeBaseView
      knowledgeItems={knowledgeItems}
      onAdd={addKnowledgeItem}
      onUpdate={updateKnowledgeItem}
      onDelete={deleteKnowledgeItem}
    />
  );
}

