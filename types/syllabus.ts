export type TopicStatus = "done" | "partial" | "barely" | "untouched";

export interface NoteComment {
  id: string;
  author: string;
  timestamp: string;
  content: string;
  imageUrl?: string;
}

export interface TopicNote {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  subComments?: NoteComment[];
  updatedAt: string;
}

export interface SyllabusItem {
  id: string;
  title: string;
  status: TopicStatus;
  hasNote: boolean;
  note?: TopicNote;
  isExpanded?: boolean;
  children?: SyllabusItem[];
}

export interface SyllabusData {
  id: string;
  fileName: string;
  lastModified: string;
  items: SyllabusItem[];
  isDraft?: boolean;
}
