export interface CodeSnippet {
  language: string;
  code: string;
  explanation: string;
}

export interface Section {
  chapter_title: string;
  detailed_notes: string;
  code_snippets: CodeSnippet[];
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface PracticeProblem {
  title: string;
  statement: string;
  hints: string[];
  solution_approach: string;
  level?: string;
  leetcode_similar_problem?: string;
}

export interface VideoSummaryData {
  executive_summary: string;
  sections: Section[];
  recap: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  problems: PracticeProblem[];
}

export interface PlaylistItem {
  id?: string;
  title: string;
  url: string;
  thumbnail?: string;
  completed?: boolean;
  text?: string;
  partIndex?: number;
  totalParts?: number;
  chunkIndex?: number;
}

export interface PlaylistData {
  title: string;
  items: PlaylistItem[];
}
