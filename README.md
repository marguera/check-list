# Checklist App

A modern, WYSIWYG checklist application built with React, TypeScript, Tailwind CSS, and TipTap.

## Features

- **WYSIWYG Task Management**: Drag and drop to reorder tasks with visual feedback
- **Fullscreen Dialogs**: Add/edit/view task details in fullscreen dialogs
- **Rich Text Instructions**: WYSIWYG editor with support for:
  - Text formatting (bold, italic)
  - Lists (bulleted and numbered)
  - Links
  - Images
  - Knowledge database links (custom tool)
- **Knowledge Database Integration**: Link knowledge items in instructions and view them in a dedicated tab
- **Task Completion**: Confirmation dialog to ensure all instructions were followed
- **Local Storage Persistence**: All data is automatically saved to browser local storage

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** components (Dialog, Tabs, Button)
- **TipTap** for rich text editing
- **@dnd-kit** for drag and drop functionality

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── checklist/        # Checklist-specific components
│   ├── dialogs/          # Dialog components (TaskDialog, tabs)
│   ├── editor/           # TipTap editor and extensions
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── App.tsx               # Main application component
```

## Usage

1. **Add a Task**: Click the "Add Task" button to create a new task
2. **Edit Task Details**: Click "Add/Edit Details" on any task to open the fullscreen dialog
3. **Add Instructions**: Use the WYSIWYG editor to add rich text instructions
4. **Link Knowledge Items**: Click the book icon in the editor toolbar to insert knowledge database links
5. **View Knowledge Database**: Switch to the "Knowledge Database" tab to see all linked items
6. **Complete Tasks**: Click the circle icon to complete a task (confirmation dialog will appear)
7. **Reorder Tasks**: Drag and drop tasks to reorder them

## Data Persistence

All checklist data is automatically saved to browser local storage. The data persists across page reloads.

## Development

The project uses:
- TypeScript for type safety
- ESLint for code quality (configure as needed)
- Tailwind CSS for utility-first styling
- Vite for fast development and optimized builds

## License

MIT


