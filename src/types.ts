// Types for the Psychology Quiz Application

export type ChapterType = 'all' | 'chapter6' | 'chapter7' | 'chapter8' | 'chapter9' | 'chapter10' | 'chapter11' | 'chapter12';

export interface ChapterInfo {
  id: ChapterType;
  title: string;
  fileName: string;
}

export interface Problem {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: 'A' | 'B' | 'C' | 'D';
  chapter: string;
  related_info: string;
  incorrect_count: number;
}

export interface Session {
  id: number;
  timestamp: string;
  chapter: ChapterType;
  total_questions: number;
  wrong_problems: Problem[];
  score: number;
}

export interface QuizState {
  sessions: Session[];
  problem_stats: Record<string, ProblemStat>;
  last_updated?: string;
}

export interface ProblemStat {
  incorrect_count: number;
  total_attempts: number;
  chapter: string;
}

export interface CurrentIterationStats {
  total_questions: number;
  correct_first_try: number;
  total_attempts: number;
  correct_attempts: number;
}

export interface QuestionResult {
  problem: Problem;
  selected: 'A' | 'B' | 'C' | 'D';
  is_correct: boolean;
  is_retry: boolean;
}

export type GamePhase = 
  | 'loading'
  | 'welcome'
  | 'question'
  | 'feedback'
  | 'retry'
  | 'statistics'
  | 'iteration_complete';

