// Types for the Psychology Quiz Application

export type ChapterType =
  | 'all'
  | 'exam1-methods'
  | 'exam1-module1'
  | 'exam1-module2';

export type ProblemOption = 'A' | 'B' | 'C' | 'D';
export type QuizAnswer = ProblemOption | 'E';
export type ItemForm = 'definition' | 'scenario' | 'comparison' | 'counterexample';

export interface ChapterInfo {
  id: ChapterType;
  title: string;
  fileName: string;
}

export interface Problem {
  question: string;
  options: Record<ProblemOption, string>;
  answer: ProblemOption;
  chapter: string;
  related_info: string;
  why_high_yield: string;
  source_refs: string[];
  incorrect_count: number;
  concept_id: string;
  item_form: ItemForm;
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
  selected: QuizAnswer;
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
