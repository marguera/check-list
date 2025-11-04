import { Mark, mergeAttributes } from '@tiptap/core';
import { KnowledgeItem } from '../../types';

export interface KnowledgeDatabaseLinkOptions {
  knowledgeItems: KnowledgeItem[];
  onSelectItem: (item: KnowledgeItem) => void;
  HTMLAttributes?: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    knowledgeDatabaseLink: {
      setKnowledgeDatabaseLink: (attributes: { id: string; title: string }) => ReturnType;
      toggleKnowledgeDatabaseLink: (attributes: { id: string; title: string }) => ReturnType;
      unsetKnowledgeDatabaseLink: () => ReturnType;
    };
  }
}

const KnowledgeDatabaseLink = Mark.create<KnowledgeDatabaseLinkOptions>({
  name: 'knowledgeDatabaseLink',
  
  addOptions() {
    return {
      knowledgeItems: [],
      onSelectItem: () => {},
      HTMLAttributes: {},
    };
  },

  inclusive: false,
  exitable: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-knowledge-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {};
          }
          return {
            'data-knowledge-id': attributes.id,
          };
        },
      },
      title: {
        default: null,
        parseHTML: element => element.getAttribute('data-knowledge-title'),
        renderHTML: attributes => {
          if (!attributes.title) {
            return {};
          }
          return {
            'data-knowledge-title': attributes.title,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-knowledge-link]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const element = node as HTMLElement;
          return {
            id: element.getAttribute('data-knowledge-id'),
            title: element.getAttribute('data-knowledge-title'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, mark }) {
    return [
      'a',
      mergeAttributes(this.options.HTMLAttributes || {}, HTMLAttributes, {
        'data-knowledge-link': 'true',
        'data-knowledge-id': mark.attrs.id,
        'data-knowledge-title': mark.attrs.title,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setKnowledgeDatabaseLink:
        (attributes) =>
        ({ chain }) => {
          return chain().setMark(this.name, attributes).run();
        },
      toggleKnowledgeDatabaseLink:
        (attributes) =>
        ({ chain }) => {
          return chain().toggleMark(this.name, attributes).run();
        },
      unsetKnowledgeDatabaseLink:
        () =>
        ({ chain }) => {
          return chain().unsetMark(this.name).run();
        },
    };
  },
});

export default KnowledgeDatabaseLink;


