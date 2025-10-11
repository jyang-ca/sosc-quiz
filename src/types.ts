// Types for the Psychology Quiz Application

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

export interface QuizState {
  incorrect_problems: Problem[];
  seen_problems: string[]; // question texts
  correct_problems: string[]; // question texts
  iteration: number;
  iteration_stats: IterationStat[];
  problem_stats: Record<string, ProblemStat>;
  last_updated?: string;
}

export interface IterationStat {
  iteration: number;
  completed_at: string;
  total_questions: number;
  correct_first_try: number;
  accuracy: number;
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

