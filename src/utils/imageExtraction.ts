/**
 * Extract image URLs from HTML content
 */
export function extractImageUrls(html: string): string[] {
  const urls: string[] = [];
  if (!html) return urls;
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const images = doc.querySelectorAll('img');
  
  images.forEach((img) => {
    const src = img.getAttribute('src');
    if (src) {
      urls.push(src);
    }
  });
  
  return [...new Set(urls)]; // Remove duplicates
}

