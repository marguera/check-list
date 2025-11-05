import { NodeViewWrapper } from '@tiptap/react';
import { NodeViewProps } from '@tiptap/react';
import { useRef, useState, useCallback, useEffect } from 'react';
import { AlignLeft, AlignCenter, AlignRight, ChevronDown } from 'lucide-react';

// Standard image sizes
const IMAGE_SIZES = {
  small: 200,
  medium: 400,
  large: 600,
  xlarge: 800,
  fluid: null, // null means responsive/full width
} as const;

type ImageSize = keyof typeof IMAGE_SIZES;

const SIZE_LABELS: Record<ImageSize, string> = {
  small: 'Small (200px)',
  medium: 'Medium (400px)',
  large: 'Large (600px)',
  xlarge: 'XLarge (800px)',
  fluid: 'Fluid (responsive)',
};

export function ImageNodeView({ node, updateAttributes, selected, editor, getPos }: NodeViewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { src, alt, width, align } = node.attrs;
  const currentAlign = align || 'center';
  
  // Determine current size based on width
  const getCurrentSize = (): ImageSize => {
    if (width === null || width === undefined) {
      return 'fluid';
    }
    // Find the closest size
    const sizes = Object.entries(IMAGE_SIZES)
      .filter(([_, value]) => value !== null)
      .map(([key, value]) => ({ key: key as ImageSize, value: value as number }))
      .sort((a, b) => Math.abs(a.value - width) - Math.abs(b.value - width));
    
    return sizes[0]?.key || 'medium';
  };
  
  const currentSize = getCurrentSize();

  const handleSizeChange = useCallback((newSize: ImageSize) => {
    updateAttributes({ width: IMAGE_SIZES[newSize] });
    setIsSizeDropdownOpen(false);
  }, [updateAttributes]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isSizeDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsSizeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSizeDropdownOpen]);

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Select the image node
    if (editor && typeof getPos === 'function') {
      const pos = getPos();
      if (pos !== undefined) {
        const { view } = editor;
        const { state } = view;
        const tr = state.tr.setSelection(state.selection.constructor.near(state.doc.resolve(pos)));
        view.dispatch(tr);
      }
    }
  }, [editor, getPos]);

  const handleAlignChange = useCallback((newAlign: 'left' | 'center' | 'right') => {
    updateAttributes({ align: newAlign });
  }, [updateAttributes]);

  const getAlignmentClass = () => {
    switch (currentAlign) {
      case 'left':
        return 'float-left mr-4 mb-2';
      case 'right':
        return 'float-right ml-4 mb-2';
      case 'center':
      default:
        return 'mx-auto block';
    }
  };

  const getContainerAlignmentClass = () => {
    switch (currentAlign) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      case 'center':
      default:
        return 'text-center';
    }
  };

  return (
    <NodeViewWrapper
      ref={containerRef}
      className={`image-node-wrapper ${getContainerAlignmentClass()} ${selected ? 'selected' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-drag-handle
    >
      <div
        className={`image-container relative inline-block ${selected || isHovered ? 'show-controls' : ''}`}
        style={{
          width: width ? `${width}px` : '100%',
          maxWidth: '100%',
        }}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt || ''}
          className={`image-node ${getAlignmentClass()} rounded`}
          style={{
            width: width ? `${width}px` : '100%',
            height: 'auto',
            display: currentAlign === 'center' ? 'block' : undefined,
            cursor: selected ? 'move' : 'pointer',
            maxWidth: '100%',
          }}
          onClick={handleImageClick}
          draggable={false}
        />

        {/* Combined toolbar */}
        {(selected || isHovered) && (
          <div
            className="image-toolbar"
            style={{
              position: 'absolute',
              top: '-40px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '4px',
              alignItems: 'center',
              backgroundColor: 'white',
              padding: '4px',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 10,
            }}
          >
            {/* Alignment controls */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAlignChange('left');
                }}
                className={`align-button ${currentAlign === 'left' ? 'active' : ''}`}
                style={{
                  padding: '4px 8px',
                  border: 'none',
                  backgroundColor: currentAlign === 'left' ? '#3b82f6' : 'transparent',
                  color: currentAlign === 'left' ? 'white' : '#334155',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Align left"
              >
                <AlignLeft size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAlignChange('center');
                }}
                className={`align-button ${currentAlign === 'center' ? 'active' : ''}`}
                style={{
                  padding: '4px 8px',
                  border: 'none',
                  backgroundColor: currentAlign === 'center' ? '#3b82f6' : 'transparent',
                  color: currentAlign === 'center' ? 'white' : '#334155',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Align center"
              >
                <AlignCenter size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAlignChange('right');
                }}
                className={`align-button ${currentAlign === 'right' ? 'active' : ''}`}
                style={{
                  padding: '4px 8px',
                  border: 'none',
                  backgroundColor: currentAlign === 'right' ? '#3b82f6' : 'transparent',
                  color: currentAlign === 'right' ? 'white' : '#334155',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Align right"
              >
                <AlignRight size={16} />
              </button>
            </div>

            {/* Divider */}
            <div style={{
              width: '1px',
              height: '20px',
              backgroundColor: '#e5e7eb',
              margin: '0 2px',
            }} />

            {/* Size dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsSizeDropdownOpen(!isSizeDropdownOpen);
                }}
                style={{
                  padding: '4px 8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#334155',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                }}
                title="Size"
              >
                {SIZE_LABELS[currentSize]}
                <ChevronDown size={14} style={{ 
                  transform: isSizeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }} />
              </button>

              {/* Dropdown menu */}
              {isSizeDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    marginTop: '4px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    minWidth: '160px',
                    zIndex: 20,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {(Object.keys(IMAGE_SIZES) as ImageSize[]).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSizeChange(size);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: 'none',
                        backgroundColor: currentSize === size ? '#f3f4f6' : 'transparent',
                        color: currentSize === size ? '#3b82f6' : '#334155',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      onMouseEnter={(e) => {
                        if (currentSize !== size) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentSize !== size) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span>{SIZE_LABELS[size]}</span>
                      {currentSize === size && (
                        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selection indicator */}
        {selected && (
          <div
            className="selection-indicator"
            style={{
              position: 'absolute',
              inset: '-4px',
              border: '2px solid #3b82f6',
              borderRadius: '0.5rem',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
}

