import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageNodeView } from './ImageNodeView';
import { NodeSelection } from 'prosemirror-state';

export interface ImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes?: Record<string, any>;
}

export const ImageExtension = Image.extend<ImageOptions>({
  name: 'image',

  addOptions() {
    return {
      ...this.parent?.(),
      inline: true, // Allow inline for text wrapping
      allowBase64: true,
      HTMLAttributes: {},
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImage: (options: { src: string; alt?: string; title?: string; width?: number | null; align?: 'left' | 'center' | 'right' }) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            src: options.src,
            alt: options.alt,
            title: options.title,
            width: options.width ?? null,
            align: options.align ?? 'center',
          },
        });
      },
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null, // null means fluid/responsive
        parseHTML: (element) => {
          const width = element.getAttribute('width');
          // If width is "100%" or similar, treat as fluid
          if (width === '100%' || element.style.width === '100%' || element.style.maxWidth === '100%') {
            return null;
          }
          return width ? parseFloat(width) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            // Fluid/responsive - no width attribute
            return {};
          }
          return {
            width: attributes.width.toString(),
          };
        },
      },
      align: {
        default: 'center',
        parseHTML: (element) => {
          const align = element.getAttribute('data-align') || element.style.textAlign || 'center';
          return align === 'left' || align === 'right' || align === 'center' ? align : 'center';
        },
        renderHTML: (attributes) => {
          if (!attributes.align || attributes.align === 'center') {
            return {};
          }
          return {
            'data-align': attributes.align,
          };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },

  addKeyboardShortcuts() {
    return {
      ArrowRight: ({ editor }) => {
        const { state } = editor.view;
        const { selection } = state;
        
        // Check if selection is a node selection on an image
        if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
          const pos = selection.$anchor.pos;
          const nodeSize = selection.node.nodeSize;
          
          // Move cursor to after the image
          const newPos = pos + nodeSize;
          editor.commands.setTextSelection(newPos);
          return true;
        }
        
        return false;
      },
      ArrowLeft: ({ editor }) => {
        const { state } = editor.view;
        const { selection } = state;
        
        // Check if selection is a node selection on an image
        if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
          const pos = selection.$anchor.pos;
          
          // Move cursor to before the image
          editor.commands.setTextSelection(pos - 1);
          return true;
        }
        
        return false;
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const element = node as HTMLElement;
          return {
            src: element.getAttribute('src'),
            alt: element.getAttribute('alt'),
            width: element.getAttribute('width') ? parseFloat(element.getAttribute('width') || '0') : null,
            align: element.getAttribute('data-align') || element.style.textAlign || 'center',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { align, width, ...rest } = HTMLAttributes;
    const attrs: Record<string, any> = { ...rest };

    if (width) {
      attrs.width = width.toString();
    }

    if (align && align !== 'center') {
      attrs['data-align'] = align;
    }

    return ['img', attrs];
  },
});

