import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { ImageExtension } from './ImageExtension';
import KnowledgeDatabaseLink from './KnowledgeDatabaseLinkTool';
import { KnowledgeItem } from '../../types';
import { Button } from '../ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  BookOpen,
} from 'lucide-react';
import { KnowledgeLinkDialog } from './KnowledgeLinkDialog';
import { useState, useRef, useEffect } from 'react';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  knowledgeItems: KnowledgeItem[];
  onInsertKnowledgeLink?: (item: KnowledgeItem) => void;
  onKnowledgeLinkClick?: (item: KnowledgeItem) => void;
  editable?: boolean;
  showKnowledgeLinkButton?: boolean;
}

export function TipTapEditor({
  content,
  onChange,
  knowledgeItems,
  onInsertKnowledgeLink,
  onKnowledgeLinkClick,
  editable = true,
  showKnowledgeLinkButton = true,
}: TipTapEditorProps) {
  const [knowledgeDialogOpen, setKnowledgeDialogOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const previousContentRef = useRef<string>('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      ImageExtension.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
      KnowledgeDatabaseLink.configure({
        knowledgeItems,
        onSelectItem: (item) => {
          onInsertKnowledgeLink?.(item);
        },
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      previousContentRef.current = html;
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto min-h-[300px] p-4 focus:outline-none',
      },
      handlePaste: (_view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find(item => item.type.startsWith('image/'));
        
        if (imageItem) {
          event.preventDefault();
          const file = imageItem.getAsFile();
          if (file && editor) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const dataUrl = e.target?.result as string;
              if (dataUrl) {
                editor.chain().focus().setImage({ src: dataUrl }).run();
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  // Reset ref when editor is created/recreated (when key changes)
  useEffect(() => {
    if (editor) {
      previousContentRef.current = editor.getHTML();
    }
  }, [editor]);

  // Update editor content when prop changes externally (switching tasks)
  // Only update if content is different from what we last emitted AND editor is not focused
  // This prevents cursor resets while typing
  useEffect(() => {
    if (!editor) return;
    
    // Don't update if editor is focused (user is typing)
    if (editor.isFocused) {
      return;
    }
    
    const currentContent = editor.getHTML();
    
    // Only update if content prop changed AND it's different from what we emitted
    // This means it's an external change (switching tasks), not user typing
    if (content !== currentContent && content !== previousContentRef.current) {
      previousContentRef.current = content;
      editor.commands.setContent(content, false);
    } else if (content === currentContent) {
      // Sync ref when content matches
      previousContentRef.current = currentContent;
    }
  }, [content, editor]);

  // Handle clicks on knowledge links - ONLY in view mode (not editable)
  useEffect(() => {
    if (!editor || !onKnowledgeLinkClick || editable) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[data-knowledge-link]') as HTMLAnchorElement;
      
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        const knowledgeId = link.getAttribute('data-knowledge-id');
        if (knowledgeId) {
          const item = knowledgeItems.find(item => item.id === knowledgeId);
          if (item) {
            onKnowledgeLinkClick(item);
          }
        }
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('click', handleClick);
    
    return () => {
      editorElement.removeEventListener('click', handleClick);
    };
  }, [editor, onKnowledgeLinkClick, editable, knowledgeItems]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    imageInputRef.current?.click();
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          editor.chain().focus().setImage({ src: dataUrl }).run();
        }
      };
      reader.readAsDataURL(file);
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const openKnowledgeLinkDialog = () => {
    if (knowledgeItems.length === 0) {
      alert('No knowledge items available');
      return;
    }
    setKnowledgeDialogOpen(true);
  };

  const handleKnowledgeItemSelect = (item: KnowledgeItem) => {
    // If there's a selection, apply the link to the selection (like Link tool)
    // Otherwise, insert the item title as a link
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;
    
    if (hasSelection) {
      // Apply link to selected text - exactly like setLink
      editor.chain().focus().setKnowledgeDatabaseLink({
        id: item.id,
        title: item.title,
      }).run();
    } else {
      // Insert the item title as a link
      editor.chain()
        .focus()
        .insertContent(item.title)
        .setTextSelection({ from: from, to: from + item.title.length })
        .setKnowledgeDatabaseLink({
          id: item.id,
          title: item.title,
        })
        .setTextSelection(from + item.title.length)
        .run();
    }
    
    if (onInsertKnowledgeLink) {
      onInsertKnowledgeLink(item);
    }
  };

  const getCurrentHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'heading-1';
    if (editor.isActive('heading', { level: 2 })) return 'heading-2';
    if (editor.isActive('heading', { level: 3 })) return 'heading-3';
    if (editor.isActive('heading', { level: 4 })) return 'heading-4';
    if (editor.isActive('heading', { level: 5 })) return 'heading-5';
    if (editor.isActive('heading', { level: 6 })) return 'heading-6';
    return 'paragraph';
  };

  const handleHeadingChange = (value: string) => {
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value.split('-')[1]) as 1 | 2 | 3 | 4 | 5 | 6;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  const headingOptions = [
    { value: 'paragraph', label: 'Paragraph' },
    { value: 'heading-1', label: 'Heading 1' },
    { value: 'heading-2', label: 'Heading 2' },
    { value: 'heading-3', label: 'Heading 3' },
    { value: 'heading-4', label: 'Heading 4' },
    { value: 'heading-5', label: 'Heading 5' },
    { value: 'heading-6', label: 'Heading 6' },
  ];

  return (
    <div className="rounded-lg overflow-hidden focus:outline-none focus:ring-0 focus-visible:outline-none">
      {editable && (
        <div className="border-b border-slate-200 p-2 flex gap-2 flex-wrap">
          <div className="relative">
            <select
              value={getCurrentHeading()}
              onChange={(e) => handleHeadingChange(e.target.value)}
              className="appearance-none bg-white border border-slate-300 rounded-md px-3 py-1.5 pr-8 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23334155' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                paddingRight: '2rem',
              }}
            >
              {headingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-px bg-slate-200 mx-1" />
          <Button
            type="button"
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="w-px bg-slate-200 mx-1" />
          <Button
            type="button"
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <div className="w-px bg-slate-200 mx-1" />
          <Button
            type="button"
            variant={editor.isActive('link') ? 'default' : 'ghost'}
            size="sm"
            onClick={addLink}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addImage}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          {showKnowledgeLinkButton && (
            <>
              <div className="w-px bg-slate-200 mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={openKnowledgeLinkDialog}
                title="Insert knowledge database link"
              >
                <BookOpen className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )}
      <EditorContent 
        editor={editor} 
        className="prose max-w-none focus:outline-none focus:ring-0 focus-visible:outline-none"
      />
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        onChange={handleImageFileSelect}
        className="hidden"
      />
      <KnowledgeLinkDialog
        open={knowledgeDialogOpen}
        onOpenChange={setKnowledgeDialogOpen}
        knowledgeItems={knowledgeItems}
        onSelect={handleKnowledgeItemSelect}
      />
      <style>{`
        .ProseMirror {
          outline: none;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
          line-height: 1.2;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
          line-height: 1.3;
        }
        .ProseMirror h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
          line-height: 1.4;
        }
        .ProseMirror h4 {
          font-size: 1em;
          font-weight: bold;
          margin: 1em 0;
          line-height: 1.5;
        }
        .ProseMirror h5 {
          font-size: 0.83em;
          font-weight: bold;
          margin: 1.17em 0;
          line-height: 1.5;
        }
        .ProseMirror h6 {
          font-size: 0.67em;
          font-weight: bold;
          margin: 1.33em 0;
          line-height: 1.5;
        }
        .ProseMirror p {
          margin: 0.5em 0;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .ProseMirror ul {
          list-style-type: disc;
        }
        .ProseMirror ol {
          list-style-type: decimal;
        }
        .ProseMirror li {
          margin: 0.25em 0;
          display: list-item;
        }
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }
        .ProseMirror a:hover {
          color: #1d4ed8;
        }
        .ProseMirror strong {
          font-weight: bold;
        }
        .ProseMirror em {
          font-style: italic;
        }
        /* Image node styles */
        .ProseMirror .image-node-wrapper {
          margin: 1em 0;
          clear: both;
        }
        .ProseMirror .image-node-wrapper.text-left {
          text-align: left;
        }
        .ProseMirror .image-node-wrapper.text-center {
          text-align: center;
        }
        .ProseMirror .image-node-wrapper.text-right {
          text-align: right;
        }
        .ProseMirror .image-node-wrapper.selected {
          outline: none;
        }
        .ProseMirror .image-container {
          position: relative;
          display: inline-block;
          max-width: 100%;
        }
        .ProseMirror .image-node {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          user-select: none;
        }
        .ProseMirror .image-node.float-left {
          float: left;
          margin-right: 1em;
          margin-bottom: 0.5em;
          margin-top: 0.5em;
        }
        .ProseMirror .image-node.float-right {
          float: right;
          margin-left: 1em;
          margin-bottom: 0.5em;
          margin-top: 0.5em;
        }
        .ProseMirror .image-node.block {
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        /* Text wrapping for paragraphs with images */
        .ProseMirror p {
          overflow: hidden;
        }
        .ProseMirror p::after {
          content: "";
          display: table;
          clear: both;
        }
        /* Image toolbar */
        .ProseMirror .image-toolbar {
          transition: opacity 0.2s;
        }
        .ProseMirror .image-container:hover .image-toolbar,
        .ProseMirror .image-container.show-controls .image-toolbar {
          opacity: 1;
        }
        /* Alignment controls */
        .ProseMirror .align-button {
          transition: background-color 0.2s, color 0.2s;
        }
        .ProseMirror .align-button:hover {
          background-color: #e5e7eb !important;
        }
        .ProseMirror .align-button.active {
          background-color: #3b82f6 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
