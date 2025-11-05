import { Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { ImageViewerDialog } from './ImageViewerDialog';

interface ImagesTabProps {
  imageUrls: string[];
  mode?: 'view' | 'edit' | 'completion';
}

export function ImagesTab({ imageUrls, mode = 'edit' }: ImagesTabProps) {
  const isViewMode = mode === 'view' || mode === 'completion';
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (imageUrls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ImageIcon className={`h-12 w-12 mb-4 ${isViewMode ? 'text-white/30' : 'text-slate-300'}`} />
        <p className={isViewMode ? 'text-white/60' : 'text-slate-500'}>No images in instructions</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className={`text-sm mb-4 ${isViewMode ? 'text-white/70' : 'text-slate-600'}`}>
          {imageUrls.length} image{imageUrls.length !== 1 ? 's' : ''} in instructions
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {imageUrls.map((url, index) => (
            <div
              key={index}
              className={`border rounded-lg overflow-hidden transition-shadow cursor-pointer ${
                isViewMode 
                  ? 'border-white/20 hover:shadow-lg hover:shadow-white/10' 
                  : 'border-slate-200 hover:shadow-md'
              }`}
              onClick={() => setSelectedImage(url)}
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  // Show placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-family="sans-serif" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <ImageViewerDialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
        imageUrl={selectedImage}
        alt="Image preview"
      />
    </>
  );
}

