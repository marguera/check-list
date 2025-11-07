import { Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { ImageViewerDialog } from '../dialogs/ImageViewerDialog';

interface ManageImagesTabProps {
  imageUrls: string[];
}

export function ManageImagesTab({ imageUrls }: ManageImagesTabProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (imageUrls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ImageIcon className="h-12 w-12 mb-4 text-white/30" />
        <p className="text-white/60">No images in instructions</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="text-sm mb-4 text-white/60 uppercase tracking-wide">
          {imageUrls.length} image{imageUrls.length !== 1 ? 's' : ''} in instructions
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {imageUrls.map((url, index) => (
            <div
              key={index}
              className="border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 overflow-hidden transition-colors cursor-pointer"
              onClick={() => setSelectedImage(url)}
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%231f2933"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%234f5d75" font-family="sans-serif" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E';
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

