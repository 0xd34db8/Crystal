<p align="center">
  <img src="public/logo.png" width="76" height="96" alt="Crystal Logo" />
</p>

<h1 align="center">Crystal</h1>

<p align="center">
  Hierarchical syllabus organizer and note workspace.
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" /></a>
  <a href="https://tiptap.dev"><img src="https://img.shields.io/badge/TipTap-Editor-000000?style=flat-square" alt="TipTap" /></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" /></a>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#key-features">Key Features</a> •
  <a href="#progress-tracking">Progress Tracking</a> •
  <a href="#universal-llm-connectivity">LLM Integration</a> •
  <a href="#data-schema-crystal">Data Schema</a> •
  <a href="#project-structure">Project Structure</a>
</p>

<p align="center">
  <code>npm install &amp;&amp; npm run dev</code>
</p>

---

> [!IMPORTANT]
> **Client-Side & Model Agnostic**: Crystal operates entirely within the user's browser. API keys, course syllabi, and notes are stored locally in browser storage without third-party database dependencies. Users can connect any supported provider (Google Gemini, OpenAI, Anthropic Claude, OpenRouter, Groq, or custom OpenAI-compatible endpoints) or use the workflow completely offline.

---

## Overview

Academic curricula and course outlines are often distributed as unstructured PDF documents, Word tables, or dense syllabi. Extracting structured study paths and keeping organized, topic-specific notes across large modules is cumbersome with standard word processors.

- Dedicated study note workspace for each syllabus topic.
- TipTap-powered editor with bidirectional Markdown support:
  - Headings, bold, italic, underline, strikethrough, and text highlighting.
  - Ordered lists, bullet lists, and task checkboxes.
  - Code blocks, blockquotes, and text alignment controls.
  - Inline image insertion with customizable resizing handles.
- Nested sub-comments for attaching targeted topic questions, clarifications, and sectional breakdowns.
- Optional AI-assisted study guide generation and sub-topic explanations.

---

## Key Features

### Intelligent Syllabus Ingestion

- Ingest course curricula from **PDF documents**, **Microsoft Word (`.docx`)**, **plain text (`.txt`)**, and native **`.crystal` / `.json`** files.
- **Core Syllabus Only Filter**: Toggleable parser directive that excludes non-syllabus material (e.g., lab experiments, learning outcomes, textbook citations, and grading matrices) to focus exclusively on conceptual coursework.
- **Instant Homepage Paste**: Paste generated JSON or `.crystal` data anywhere on the homepage (`Cmd+V` / `Ctrl+V`) to automatically parse the tree and launch the workspace.

### Topic-Level Note Workspace

- Rich text editor powered by TipTap with bidirectional GitHub-flavored Markdown support.
- Text formatting: Headings (H1-H3), bold, italic, underline, strikethrough, highlights, blockquotes, inline code, and code blocks.
- Lists: Bullet lists, ordered lists, and interactive task checkboxes.
- Media: Inline image upload and URL insertion with interactive visual resize controls.
- Nested Sub-Sections: Topic comment threads for attaching targeted concept inquiries, derivations, and clarifications.

### Prompt Export for Web LLMs

- Built-in prompt generator allowing users without API keys to copy structured formatting prompts for use with external chat interfaces (ChatGPT, Claude, Gemini, etc.).
- **Unified Two-in-One Action Buttons**: Note generation and prompt copying combined into a single cohesive interface element.

### Universal LLM Connectivity

- Direct browser integration with major providers:
  - Google Gemini
  - OpenAI
  - Anthropic Claude
  - OpenRouter
  - Groq
  - Custom OpenAI-compatible endpoints with custom base URLs
- Custom model overrides for dev, fine-tuned, or private deployments.

### Portable File Format

- Native `.crystal` file format (JSON-based schema storing tree hierarchy, notes, sub-comments, and completion states).
- Integration with the browser File System Access API (`showSaveFilePicker`) for native save dialogs with automatic fallback download.
- Local storage caching for instant access to recent syllabi.

---

## Progress Tracking

| Status             | Color Marker      | Description                                             |
| :----------------- | :---------------- | :------------------------------------------------------ |
| **Done**           | Blue              | Topics fully reviewed, summarized, and understood.      |
| **Partially Done** | Green             | Topics actively in progress or partially completed.     |
| **Barely Done**    | Red               | Topics briefly reviewed or requiring significant study. |
| **Untouched**      | Default / Neutral | Topics yet to be started.                               |

The interactive status indicator chip in the workspace footer displays the real-time completion percentage (percentage of topics marked Done) and expands into a comprehensive breakdown popover showing item distributions across each progress tier.

---

## Quick Start

### Prerequisites

- Node.js 18.x or later
- npm, pnpm, or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/crystal.git
   cd crystal
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Launch the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

### Production Build

```bash
npm run build
npm run start
```

---

## Universal LLM Connectivity

Crystal provides flexible AI options. Users can configure API credentials directly or use external web models without an API key:

### Option A: Direct API Configuration

1. Open the API Key modal via the key icon in the navigation bar.
2. Select your provider:
   - **Google Gemini**: Standard Generative Language endpoint (`gemini-3.8-flash` or custom).
   - **OpenAI**: Chat completions endpoint (`gpt-4o-mini`, `gpt-4o`, etc.).
   - **Anthropic Claude**: Messages API with direct browser support (`claude-3-5-haiku`, etc.).
   - **OpenRouter**: Unified model router.
   - **Groq**: High-throughput inference (`llama-3.3-70b-versatile`).
   - **Custom**: Any OpenAI-compatible server URL (e.g. Ollama, vLLM, LocalAI).
3. Test credentials using the integrated connection tester. Keys are persisted only in local browser storage.

### Option B: External LLM Workflow (No API Key Required)

1. On the Crystal homepage, click **Copy Tree Prompt** (or **Prompt**).
2. Attach your syllabus document or paste the prompt into your external LLM of choice (ChatGPT, Claude, Gemini web interface).
3. Copy the resulting JSON output from the LLM.
4. Return to Crystal and press `Cmd+V` (macOS) or `Ctrl+V` (Windows/Linux) anywhere on the homepage. Crystal will detect, parse, and open your syllabus immediately.

---

## Keyboard Shortcuts

| Shortcut           | Context     | Action                                                     |
| :----------------- | :---------- | :--------------------------------------------------------- |
| `Cmd+V` / `Ctrl+V` | Homepage    | Instantly parse clipboard syllabus JSON and open workspace |
| `Cmd+S` / `Ctrl+S` | Editor      | Export current syllabus as native `.crystal` file          |
| `Cmd+B` / `Ctrl+B` | Note Editor | Toggle bold formatting                                     |
| `Cmd+I` / `Ctrl+I` | Note Editor | Toggle italic formatting                                   |
| `Cmd+U` / `Ctrl+U` | Note Editor | Toggle underline formatting                                |
| `Cmd+Shift+X`      | Note Editor | Toggle strikethrough                                       |
| `Cmd+Shift+H`      | Note Editor | Toggle text highlight                                      |
| `Cmd+Shift+9`      | Note Editor | Toggle task checklist                                      |
| `Cmd+Shift+L`      | Note Editor | Align text left                                            |
| `Cmd+Shift+E`      | Note Editor | Align text center                                          |
| `Cmd+Shift+R`      | Note Editor | Align text right                                           |

---

## Data Schema (.crystal)

Files exported with the `.crystal` extension use standardized JSON preserving tree hierarchy, notes, sub-comments, and completion statuses:

```json
{
  "id": "syllabus-1793889893779",
  "fileName": "Cloud Architecture",
  "lastModified": "Just now",
  "items": [
    {
      "id": "u-1",
      "title": "UNIT I: Cloud Foundations",
      "status": "done",
      "hasNote": true,
      "isExpanded": true,
      "note": {
        "id": "note-u-1",
        "title": "UNIT I: Cloud Foundations",
        "content": "### Overview\nKey architectural principles...",
        "updatedAt": "10:30 AM",
        "subComments": [
          {
            "id": "comment-1",
            "author": "Storage Tiers",
            "timestamp": "Nov 05, 2026 at 10:32 AM",
            "content": "Details on cold vs hot tiers..."
          }
        ]
      },
      "children": [
        {
          "id": "u-1-1",
          "title": "Virtual Private Cloud (VPC)",
          "status": "partial",
          "hasNote": false,
          "isExpanded": true
        }
      ]
    }
  ]
}
```

---

## Project Structure

```text
Crystal/
├── app/
│   ├── globals.css              # Global styles, fonts, and Tailwind directives
│   ├── layout.tsx               # Root application layout and dark mode wrapper
│   ├── page.tsx                 # Homepage: file ingestion, recent files, paste listener
│   └── edit/
│       └── page.tsx             # Main study workspace: tree view and note editor
├── components/
│   ├── ApiKeyModal.tsx          # Multi-provider credential configuration modal
│   ├── CrystalLogo.tsx          # Brand logo component
│   ├── MarkdownRenderer.tsx     # Markdown display engine
│   ├── NoteEditor.tsx           # TipTap rich markdown editor with unified split buttons
│   ├── ResizableImage.tsx       # Resizable inline image node view for TipTap
│   ├── StatusChip.tsx           # Footer progress breakdown chip and popover
│   ├── SyllabusTree.tsx         # Hierarchical tree viewer with status controls
│   ├── ThemeToggle.tsx          # Light/dark mode toggle
│   ├── TopBar.tsx               # Workspace title bar and search controls
│   ├── home/                    # Homepage sub-components (RecentFileCard)
│   └── layout/                  # Shared window controls and app header
├── lib/
│   ├── ai.ts                    # Universal LLM caller and parsing prompt templates
│   ├── fileUtils.ts             # PDF, Word (.docx), and text document extractors
│   ├── gemini.ts                # Legacy compatibility exports
│   ├── parser.ts                # JSON sanitizer, structure validator, fallback parser
│   ├── storage.ts               # Local browser storage drivers for syllabi & config
│   └── syllabusUtils.ts         # Tree traversal, stats calculation, and .crystal export
├── public/                      # Static branding assets and icons
└── types/
    └── syllabus.ts              # Core TypeScript interfaces and domain models
```

---

## License

This project is licensed under the MIT License.
