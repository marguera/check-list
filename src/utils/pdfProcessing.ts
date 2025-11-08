import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - Vite handles this import
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set up the worker for pdfjs-dist using the local worker file
if (typeof window !== 'undefined') {
  // Use the worker from the installed package via Vite
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
}

/**
 * Extract images from a PDF file and return a map of placeholder names to base64 data URLs
 * Returns empty map if image extraction fails (non-blocking)
 */
export async function extractImagesFromPDF(pdfFile: File): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();
  
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    
    let imageIndex = 1;
    const processedImages = new Set<string>(); // Track processed images to avoid duplicates
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        
        // Get the operator list to find image references
        const imageNames = new Set<string>();
        try {
          const operatorList = await page.getOperatorList();
          
          for (let i = 0; i < operatorList.fnArray.length; i++) {
            const op = operatorList.fnArray[i];
            const args = operatorList.argsArray[i];
            
            // Check for image operations
            const isImageOp = 
              op === pdfjsLib.OPS.paintImageXObject || 
              (op as number) === 82 || // paintXObject
              (op as number) === 83;   // paintInlineImageXObject
            
            if (isImageOp && args && args.length > 0) {
              imageNames.add(args[0]);
            }
          }
        } catch (opError) {
          // Continue if operator list fails
        }
        
        // Now extract images - get operator list again to trigger object loading
        // This helps ensure objects are available
        try {
          await page.getOperatorList();
        } catch {
          // Continue even if this fails
        }
        
        // Extract each image
        for (const imageName of imageNames) {
          try {
            // Skip if we've already processed this image
            if (processedImages.has(imageName)) {
              continue;
            }
            
            // Wait for the object to be resolved
            // The objs.get() method returns a promise that resolves when the object is ready
            let imageDict: any = null;
            try {
              // Request the object - this will trigger loading if not already loaded
              // and wait for it to be resolved
              imageDict = await page.objs.get(imageName);
            } catch (resolveError: any) {
              // If the object isn't resolved yet, we need to wait for it
              // Try to resolve it by accessing it through the resources
              try {
                // Sometimes objects need to be explicitly requested
                // Wait a bit and try again
                await new Promise(resolve => setTimeout(resolve, 100));
                imageDict = await page.objs.get(imageName);
              } catch {
                // If still can't get it, skip this image
                console.warn(`Could not resolve image object ${imageName} on page ${pageNum}`);
                continue;
              }
            }
            
            if (imageDict) {
                // Try different ways to get image data
                let imageData: Uint8Array | string | null = null;
                let mimeType = 'image/png';
                
                // Method 1: Direct data property
                if (imageDict.data) {
                  imageData = imageDict.data;
                }
                // Method 2: Try to get raw data using getBytes
                else if (typeof (imageDict as any).getBytes === 'function') {
                  try {
                    const bytes = await (imageDict as any).getBytes();
                    imageData = bytes;
                  } catch {
                    // Try alternative method
                  }
                }
                // Method 3: Try to access stream data
                else if ((imageDict as any).stream) {
                  try {
                    const stream = (imageDict as any).stream;
                    const bytes = await stream.getBytes();
                    imageData = bytes;
                  } catch {
                    // Skip if we can't get bytes
                  }
                }
                
                if (imageData) {
                  let base64: string;
                  
                  if (imageData instanceof Uint8Array) {
                    // Convert Uint8Array to base64 more efficiently
                    const chunks: string[] = [];
                    const chunkSize = 8192;
                    for (let j = 0; j < imageData.length; j += chunkSize) {
                      const chunk = imageData.slice(j, j + chunkSize);
                      chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
                    }
                    base64 = btoa(chunks.join(''));
                  } else if (typeof imageData === 'string') {
                    base64 = imageData;
                  } else {
                    continue;
                  }
                  
                  // Determine MIME type
                  if (imageDict.filter) {
                    const filter = imageDict.filter;
                    if (Array.isArray(filter)) {
                      const filterNames = filter.map((f: any) => f?.name || f).join(' ');
                      if (filterNames.includes('DCTDecode') || filterNames.includes('DCT')) {
                        mimeType = 'image/jpeg';
                      }
                    } else if (typeof filter === 'string' && filter.includes('DCT')) {
                      mimeType = 'image/jpeg';
                    }
                  }
                  
                  const dataUrl = `data:${mimeType};base64,${base64}`;
                  const placeholder = `image-${imageIndex}`;
                  imageMap.set(placeholder, dataUrl);
                  processedImages.add(imageName);
                  imageIndex++;
                }
              }
          } catch (error) {
            // Skip individual image errors, continue processing
            console.warn(`Error extracting image ${imageName} from page ${pageNum}:`, error);
            continue;
          }
        }
      } catch (error) {
        // Skip page errors, continue with next page
        console.warn(`Error processing page ${pageNum}:`, error);
        continue;
      }
    }
  } catch (error) {
    // Don't throw - just log and return empty map
    // This allows text extraction to continue even if images fail
    console.warn('Error extracting images from PDF (continuing without images):', error);
    return new Map();
  }
  
  return imageMap;
}

/**
 * Extract text from a PDF file and replace image references with placeholders
 */
export async function extractTextFromPDF(
  pdfFile: File,
  imagePlaceholders: Map<string, string>
): Promise<string> {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    
    const textParts: string[] = [];
    let imageIndex = 1;
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Extract text items
      const pageText = textContent.items
        .map((item: any) => {
          if ('str' in item) {
            return item.str;
          }
          return '';
        })
        .join(' ');
      
      // Check for images on this page and insert placeholders
      // We'll insert image placeholders at the end of each page for now
      // A more sophisticated approach would track image positions
      const operatorList = await page.getOperatorList();
      const imagesOnPage: string[] = [];
      
      for (let i = 0; i < operatorList.fnArray.length; i++) {
        const op = operatorList.fnArray[i];
        
        // Check for image operations (82 is paintXObject op code)
        if (op === pdfjsLib.OPS.paintImageXObject || (op as number) === 82) {
          const placeholder = `image-${imageIndex}`;
          if (imagePlaceholders.has(placeholder)) {
            imagesOnPage.push(placeholder);
            imageIndex++;
          }
        }
      }
      
      if (pageText.trim()) {
        textParts.push(pageText);
      }
      
      // Add image placeholders after page text
      if (imagesOnPage.length > 0) {
        textParts.push(`\n[Images: ${imagesOnPage.map(p => `[IMAGE:${p}]`).join(', ')}]\n`);
      }
      
      // Add page break between pages
      if (pageNum < numPages) {
        textParts.push('\n---\n');
      }
    }
    
    return textParts.join('\n');
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

