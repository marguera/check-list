/**
 * Compress and resize images to reduce storage size
 * This helps prevent localStorage quota exceeded errors
 */

const MAX_WIDTH = 400; // Very small for 5KB target
const MAX_HEIGHT = 400; // Very small for 5KB target
const MAX_QUALITY = 0.5; // Lower quality for smaller file size
const MAX_SIZE_KB = 5; // Maximum size per image in KB - very strict limit

/**
 * Compress an image data URL
 * Returns a compressed data URL or the original if compression fails
 */
export async function compressImageDataUrl(
  dataUrl: string,
  maxWidth: number = MAX_WIDTH,
  maxHeight: number = MAX_HEIGHT,
  quality: number = MAX_QUALITY
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(dataUrl); // Fallback to original
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob and check size
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(dataUrl); // Fallback to original
              return;
            }
            
            // Check if compressed size is acceptable
            const sizeKB = blob.size / 1024;
            if (sizeKB > MAX_SIZE_KB) {
              // Try with progressively lower quality and smaller dimensions until we meet size target
              let currentQuality = Math.max(0.1, quality * 0.4);
              let attempts = 0;
              const maxAttempts = 8; // More attempts for strict 5KB limit
              
              const tryCompress = (targetQuality: number, attemptCount: number, scaleDown: number = 1): void => {
                // If we've tried multiple times, also reduce dimensions
                const scale = attemptCount > 3 ? Math.max(0.5, 1 - (attemptCount - 3) * 0.1) : scaleDown;
                const scaledWidth = Math.max(200, Math.floor(width * scale));
                const scaledHeight = Math.max(200, Math.floor(height * scale));
                
                // Create new canvas with scaled dimensions if needed
                const compressCanvas = scale < 1 ? document.createElement('canvas') : canvas;
                if (scale < 1) {
                  compressCanvas.width = scaledWidth;
                  compressCanvas.height = scaledHeight;
                  const compressCtx = compressCanvas.getContext('2d');
                  if (compressCtx) {
                    compressCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
                  } else {
                    resolve(dataUrl);
                    return;
                  }
                }
                
                compressCanvas.toBlob(
                  (compressedBlob) => {
                    if (!compressedBlob) {
                      resolve(dataUrl);
                      return;
                    }
                    
                    const newSizeKB = compressedBlob.size / 1024;
                    if (newSizeKB > MAX_SIZE_KB && attemptCount < maxAttempts && targetQuality > 0.1) {
                      // Try again with even lower quality
                      tryCompress(Math.max(0.1, targetQuality * 0.75), attemptCount + 1, scale);
                    } else {
                      // Accept this compression or we've tried enough
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const compressedDataUrl = reader.result as string;
                        console.log(`Compressed image: ${sizeKB.toFixed(2)}KB -> ${newSizeKB.toFixed(2)}KB (quality: ${targetQuality.toFixed(2)}, size: ${scaledWidth}x${scaledHeight}, attempts: ${attemptCount + 1})`);
                        resolve(compressedDataUrl);
                      };
                      reader.onerror = () => resolve(dataUrl);
                      reader.readAsDataURL(compressedBlob);
                    }
                  },
                  'image/jpeg',
                  targetQuality
                );
              };
              
              tryCompress(currentQuality, attempts);
            } else {
              // Size is acceptable, convert to data URL
              const reader = new FileReader();
              reader.onloadend = () => {
                const compressedDataUrl = reader.result as string;
                console.log(`Compressed image: ${sizeKB.toFixed(2)}KB (quality: ${quality.toFixed(2)})`);
                resolve(compressedDataUrl);
              };
              reader.onerror = () => resolve(dataUrl);
              reader.readAsDataURL(blob);
            }
          },
          'image/jpeg',
          quality
        );
      } catch (error) {
        console.warn('Error compressing image:', error);
        resolve(dataUrl); // Fallback to original
      }
    };
    
    img.onerror = () => {
      resolve(dataUrl); // Fallback to original if image fails to load
    };
    
    img.src = dataUrl;
  });
}

/**
 * Compress all images in a map of data URLs
 */
export async function compressImageMap(
  imageMap: Map<string, string>
): Promise<Map<string, string>> {
  const compressedMap = new Map<string, string>();
  
  const compressionPromises = Array.from(imageMap.entries()).map(
    async ([key, dataUrl]) => {
      const compressed = await compressImageDataUrl(dataUrl);
      return [key, compressed] as [string, string];
    }
  );
  
  const results = await Promise.all(compressionPromises);
  results.forEach(([key, compressed]) => {
    compressedMap.set(key, compressed);
  });
  
  return compressedMap;
}

