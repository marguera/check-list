import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  alt?: string;
}

export function ImageViewerDialog({
  open,
  onOpenChange,
  imageUrl,
  alt = 'Image preview',
}: ImageViewerDialogProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom and position when image changes
  useEffect(() => {
    if (imageUrl) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [imageUrl]);

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (!imageRef.current) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(5, scale * delta));
    
    // Zoom towards mouse position
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    setPosition({
      x: position.x - (x * (newScale - scale)) / scale,
      y: position.y - (y * (newScale - scale)) / scale,
    });
    
    setScale(newScale);
  };

  // Handle mouse drag - always draggable
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch gestures for mobile
  const touchStartRef = useRef<{ distance: number; center: { x: number; y: number } } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const center = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      };
      touchStartRef.current = { distance, center };
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartRef.current) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const delta = distance / touchStartRef.current.distance;
      const newScale = Math.max(0.5, Math.min(5, scale * delta));
      
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const centerX = touchStartRef.current.center.x - rect.left - rect.width / 2;
        const centerY = touchStartRef.current.center.y - rect.top - rect.height / 2;
        
        setPosition({
          x: position.x - (centerX * (newScale - scale)) / scale,
          y: position.y - (centerY * (newScale - scale)) / scale,
        });
      }
      
      setScale(newScale);
      touchStartRef.current.distance = distance;
    } else if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    setIsDragging(false);
  };

  const zoomIn = () => {
    setScale(Math.min(5, scale + 0.25));
  };

  const zoomOut = () => {
    const newScale = Math.max(0.5, scale - 0.25);
    if (newScale <= 1) {
      setPosition({ x: 0, y: 0 });
    }
    setScale(newScale);
  };

  const resetZoom = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  if (!imageUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[100vw] !max-h-[100vh] !w-screen !h-screen !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 !p-0 flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>{alt}</DialogTitle>
        </DialogHeader>
        
        {/* Floating toolbar */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 border border-slate-200">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            title="Zoom out"
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-700 min-w-[60px] text-center font-medium">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 5}
            title="Zoom in"
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-slate-300 mx-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={rotate}
            title="Rotate"
            className="h-8 w-8 p-0"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetZoom}
            title="Reset"
            className="h-8 px-3 text-xs"
          >
            Reset
          </Button>
          <div className="w-px h-6 bg-slate-300 mx-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            title="Close"
            className="h-8 px-3 text-xs"
          >
            Close
          </Button>
        </div>

        {/* Image container - fullscreen */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden bg-black flex items-center justify-center relative w-full h-full"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt={alt}
            className="select-none"
            draggable={false}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              maxWidth: 'none',
              maxHeight: 'none',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-family="sans-serif" font-size="16"%3EImage not found%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

