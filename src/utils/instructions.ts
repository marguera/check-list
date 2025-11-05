// Helper function to check if HTML content is effectively empty
// This handles cases where HTML markup exists but no visible text content
export function isInstructionsEmpty(html: string | null | undefined): boolean {
  if (!html) return true;
  
  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get text content and trim whitespace
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  const trimmed = textContent.trim();
  
  return trimmed.length === 0;
}

