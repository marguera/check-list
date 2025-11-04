/**
 * Extract knowledge database link IDs from HTML content
 */
export function extractKnowledgeLinkIds(html: string): string[] {
  const ids: string[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const links = doc.querySelectorAll('a[data-knowledge-link]');
  
  links.forEach((link) => {
    const id = link.getAttribute('data-knowledge-id');
    if (id) {
      ids.push(id);
    }
  });
  
  return [...new Set(ids)]; // Remove duplicates
}


