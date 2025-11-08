/**
 * Extract HTML and images from a ZIP file
 */
export async function extractFromZip(zipFile: File): Promise<{
  htmlContent: string;
  images: Map<string, string>; // Map of image filename -> base64 data URL
}> {
  // Use JSZip library - we'll need to install it
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(zipFile);
  
  const images = new Map<string, string>();
  let htmlContent = '';
  const htmlFiles: string[] = [];
  
  // Process all files in the ZIP
  for (const [filename, file] of Object.entries(zip.files)) {
    if (file.dir) continue;
    
    // Check if it's an HTML file
    if (filename.toLowerCase().endsWith('.html') || filename.toLowerCase().endsWith('.htm')) {
      htmlFiles.push(filename);
      const content = await file.async('string');
      htmlContent += content + '\n\n';
    }
    // Check if it's an image file
    else if (
      filename.toLowerCase().endsWith('.png') ||
      filename.toLowerCase().endsWith('.jpg') ||
      filename.toLowerCase().endsWith('.jpeg') ||
      filename.toLowerCase().endsWith('.gif') ||
      filename.toLowerCase().endsWith('.webp') ||
      filename.toLowerCase().endsWith('.svg')
    ) {
      try {
        const imageData = await file.async('base64');
        const ext = filename.split('.').pop()?.toLowerCase() || 'png';
        let mimeType = 'image/png';
        
        if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
        else if (ext === 'gif') mimeType = 'image/gif';
        else if (ext === 'webp') mimeType = 'image/webp';
        else if (ext === 'svg') mimeType = 'image/svg+xml';
        
        const dataUrl = `data:${mimeType};base64,${imageData}`;
        // Use the filename as the key, but normalize it
        const imageKey = filename.replace(/\\/g, '/'); // Normalize path separators
        images.set(imageKey, dataUrl);
      } catch (error) {
        console.warn(`Failed to extract image ${filename}:`, error);
      }
    }
  }
  
  // If no HTML files found, return empty
  if (htmlFiles.length === 0) {
    throw new Error('No HTML files found in ZIP archive');
  }
  
  return { htmlContent, images };
}

/**
 * Process HTML content and replace image references with placeholders
 */
export function processHtmlContent(
  htmlContent: string,
  images: Map<string, string>
): {
  text: string;
  imagePlaceholders: Map<string, string>; // Map of placeholder -> original image path
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const imagePlaceholders = new Map<string, string>();
  let imageIndex = 1;
  
  // Find all images in the HTML
  const imgElements = doc.querySelectorAll('img');
  
  imgElements.forEach((img) => {
    const src = img.getAttribute('src');
    if (!src) return;
    
    // Try to match the image source with our extracted images
    // Handle both relative and absolute paths
    let matchedImage: string | null = null;
    
    // Try exact match first
    if (images.has(src)) {
      matchedImage = src;
    } else {
      // Try to find by filename (handle relative paths)
      const filename = src.split('/').pop() || src.split('\\').pop() || src;
      for (const [imagePath] of images.entries()) {
        const imageFilename = imagePath.split('/').pop() || imagePath.split('\\').pop() || imagePath;
        if (imageFilename === filename || imagePath.endsWith(src)) {
          matchedImage = imagePath;
          break;
        }
      }
    }
    
    if (matchedImage) {
      const placeholder = `image-${imageIndex}`;
      imagePlaceholders.set(placeholder, matchedImage);
      
      // Replace the image with a placeholder text
      const placeholderText = `[IMAGE:${placeholder}]`;
      const parent = img.parentElement;
      if (parent) {
        const textNode = doc.createTextNode(placeholderText);
        parent.replaceChild(textNode, img);
      }
      imageIndex++;
    }
  });
  
  // Remove script and style elements
  const scripts = doc.querySelectorAll('script, style');
  scripts.forEach(el => el.remove());
  
  // Get the body content
  const body = doc.body || doc.documentElement;
  
  // Convert HTML to text while preserving structure
  // Convert headings, lists, paragraphs to readable text
  const processElement = (element: Element | Document): string => {
    let result = '';
    
    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          result += text + ' ';
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const tagName = el.tagName.toLowerCase();
        
        if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || 
            tagName === 'h4' || tagName === 'h5' || tagName === 'h6') {
          result += '\n\n' + el.textContent?.trim() + '\n\n';
        } else if (tagName === 'p') {
          result += el.textContent?.trim() + '\n\n';
        } else if (tagName === 'li') {
          result += '- ' + el.textContent?.trim() + '\n';
        } else if (tagName === 'br') {
          result += '\n';
        } else {
          result += processElement(el);
        }
      }
    }
    
    return result;
  };
  
  const text = processElement(body).trim();
  
  return {
    text,
    imagePlaceholders,
  };
}

