# Crystal

Crystal is a syllabus organizer and study workspace that converts unstructured course outlines and documents into an interactive hierarchical curriculum tree, pairing each topic with dedicated rich text notes and visual progress tracking.

---

## Features

### Syllabus Ingestion and Hierarchical Structuring

- Import syllabi from various document formats:
  - PDF documents (`.pdf`)
  - Microsoft Word files (`.docx`)
  - Plain text files (`.txt`)
  - Native Crystal project files (`.crystal` / `.json`)
- Direct text pasting for immediate parsing.
- Intelligent curriculum structuring that breaks dense, tabular, or unformatted course documents into organized units, modules, sections, and individual subtopics.

### Topic-Level Note Taking

- Dedicated study note workspace for each syllabus topic.
- TipTap-powered editor with bidirectional Markdown support:
  - Headings, bold, italic, underline, strikethrough, and text highlighting.
  - Ordered lists, bullet lists, and task checkboxes.
  - Code blocks, blockquotes, and text alignment controls.
  - Inline image insertion with customizable resizing handles.
- Nested sub-comments for attaching targeted topic questions, clarifications, and sectional breakdowns.
- Optional AI-assisted study guide generation and sub-topic explanations.

### Progress Tracking

- Color-coded progress markers for all curriculum nodes:
  - Blue: Done
  - Green: Partially Done
  - Red: Barely Done
  - Default: Untouched
- Status indicator chip displaying overall completion percentage.
- Expandable progress popover showing item distributions across each progress state.

### Universal LLM Connectivity

- Modular provider architecture supporting:
  - Google Gemini
  - OpenAI
  - Anthropic Claude
  - OpenRouter
  - Groq
  - Custom OpenAI-compatible endpoints
- Custom model overrides and base URL configuration.
- Client-side storage of credentials without server-side persistence.

### Portable File Format

- Native `.crystal` file format (JSON-based schema storing tree hierarchy, notes, sub-comments, and completion states).
- Integration with the browser File System Access API (`showSaveFilePicker`) for native save dialogs with automatic fallback download.
- Local storage caching for instant access to recent syllabi.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Rich Text Engine**: TipTap (`@tiptap/react`, `@tiptap/starter-kit`, Markdown extension)
- **Document Processing**: Mammoth.js (Word document extraction)
- **Icons**: Lucide React

---

## Project Structure

```text
Crystal/
├── app/
│   ├── globals.css          # Global styling and Tailwind directives
│   ├── layout.tsx           # Root layout and theme wrapper
│   ├── page.tsx             # Home view (file import and recent syllabi)
│   └── edit/
│       └── page.tsx         # Main study workspace (curriculum tree + note editor)
├── components/
│   ├── ApiKeyModal.tsx      # Provider configuration modal
│   ├── CrystalLogo.tsx      # Application logo component
│   ├── MarkdownRenderer.tsx # Markdown display component
│   ├── NoteEditor.tsx       # Rich text editor and comment interface
│   ├── ResizableImage.tsx   # TipTap resizable image component
│   ├── StatusChip.tsx       # Progress tracking popover and indicator
│   ├── SyllabusTree.tsx     # Interactive curriculum tree
│   ├── ThemeToggle.tsx      # Dark / light theme toggle
│   ├── TopBar.tsx           # Workspace header and controls
│   ├── home/                # Home screen sub-components
│   └── layout/              # Shared layout components
├── lib/
│   ├── ai.ts                # Universal LLM caller and parsing prompts
│   ├── fileUtils.ts         # Document and file format processors
│   ├── parser.ts            # Local fallback text parser
│   ├── storage.ts           # Browser localStorage persistence
│   └── syllabusUtils.ts     # Tree traversal, statistics, and file export helpers
├── public/                  # Static assets and icons
└── types/
    └── syllabus.ts          # Core data models and schema definitions
```

---

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, yarn, or pnpm

### Installation

1. Clone or download the repository.
2. Install project dependencies:

```bash
npm install
```

### Running the Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Production Build

Create an optimized production build:

```bash
npm run build
npm run start
```

---

## Configuration

API keys and provider settings can be configured directly in the application:

1. Click the key icon in the navigation bar to open the settings modal.
2. Select your preferred provider (Gemini, OpenAI, Anthropic, OpenRouter, Groq, or Custom).
3. Enter your API key and, if applicable, specify a custom model identifier or endpoint base URL.
4. Use the test connection button to verify credentials. Settings are saved locally in the browser.

---

## Data Schema (.crystal)

Exported files use standard JSON formatted with the `.crystal` extension:

```json
{
  "id": "syllabus-1234567890",
  "fileName": "Machine Learning",
  "lastModified": "Just now",
  "items": [
    {
      "id": "u-1",
      "title": "UNIT I: Introduction",
      "status": "done",
      "hasNote": true,
      "isExpanded": true,
      "note": {
        "id": "note-1",
        "title": "UNIT I: Introduction",
        "content": "Comprehensive notes in Markdown format...",
        "updatedAt": "2026-11-04T00:00:00.000Z",
        "subComments": []
      },
      "children": []
    }
  ]
}
```
