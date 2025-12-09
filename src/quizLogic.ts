// Quiz logic ported from Python implementation

import type {
  Problem,
  QuizState,
  ProblemStat,
  CurrentIterationStats,
  ChapterType,
  ChapterInfo,
} from './types';

const QUESTIONS_PER_QUIZ = 20;

export const CHAPTER_INFO: ChapterInfo[] = [
  { id: 'all', title: 'All Chapters', fileName: '' },
  { id: 'chapter6', title: 'Chapter 6: Learning', fileName: 'chapter6.json' },
  { id: 'chapter7', title: 'Chapter 7: Development', fileName: 'chapter7.json' },
  { id: 'chapter8', title: 'Chapter 8: Social Psychology', fileName: 'chapter8.json' },
  { id: 'chapter9', title: 'Chapter 9: Memory', fileName: 'chapter9.json' },
  { id: 'chapter10', title: 'Chapter 10: Stress and Health', fileName: 'chapter10.json' },
  { id: 'chapter11', title: 'Chapter 11: Psychological Disorders', fileName: 'chapter11.json' },
  { id: 'chapter12', title: 'Chapter 12: Psychological Disorders Treatment', fileName: 'chapter12.json' },
];

export class QuizStateManager {
  private state: QuizState;
  private currentIterationStats: CurrentIterationStats;
  private chapter: ChapterType;
  private stateKey: string;

  constructor(chapter: ChapterType = 'all') {
    this.chapter = chapter;
    this.stateKey = `psychology_quiz_state_${chapter}`;
    this.state = this.loadState();
    this.currentIterationStats = {
      total_questions: 0,
      correct_first_try: 0,
      total_attempts: 0,
      correct_attempts: 0,
    };
  }

  private loadState(): QuizState {
    const saved = localStorage.getItem(this.stateKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load state:', e);
      }
    }
    
    return {
      sessions: [],
      problem_stats: {},
    };
  }

  saveState(): void {
    this.state.last_updated = new Date().toISOString();
    localStorage.setItem(this.stateKey, JSON.stringify(this.state));
  }

  getChapter(): ChapterType {
    return this.chapter;
  }

  getState(): QuizState {
    return { ...this.state };
  }

  getCurrentIterationStats(): CurrentIterationStats {
    return { ...this.currentIterationStats };
  }

  markSeen(_problem: Problem): void {
    // No-op in new logic, or we could track seen problems per session if needed
    // But for now, we don't track global seen problems
  }

  markCorrect(_problem: Problem): void {
    // No-op for global state
  }

  markIncorrect(problem: Problem): void {
    const question = problem.question;

    // Update problem stats
    if (!this.state.problem_stats[question]) {
      this.state.problem_stats[question] = {
        incorrect_count: 0,
        total_attempts: 0,
        chapter: problem.chapter,
      };
    }

    this.state.problem_stats[question].incorrect_count += 1;
    this.state.problem_stats[question].total_attempts += 1;
  }

  markRemainingAsIncorrect(problems: Problem[]): void {
    problems.forEach(problem => {
      // Mark as seen
      this.markSeen(problem);
      
      // Mark as incorrect
      this.markIncorrect(problem);
      
      // Update attempt stats (incorrect)
      this.updateAttemptStats(false);
      
      // Record attempt
      this.recordQuestionAttempt();
    });
  }

  updateAttemptStats(isCorrect: boolean): void {
    this.currentIterationStats.total_attempts += 1;
    if (isCorrect) {
      this.currentIterationStats.correct_attempts += 1;
    }
  }

  recordQuestionAttempt(): void {
    this.currentIterationStats.total_questions += 1;
  }

  recordCorrectFirstTry(): void {
    this.currentIterationStats.correct_first_try += 1;
  }

  addSession(
    wrongProblems: Problem[],
    totalQuestions: number
  ): void {
    // Create new session
    const newId = this.state.sessions.length > 0
      ? Math.max(...this.state.sessions.map(s => s.id)) + 1
      : 1;

    this.state.sessions.push({
      id: newId,
      timestamp: new Date().toISOString(),
      chapter: this.chapter,
      total_questions: totalQuestions,
      wrong_problems: wrongProblems,
      score: totalQuestions - wrongProblems.length
    });

    this.saveState();
  }

  selectQuizProblems(allProblems: Problem[], reviewProblems: Problem[] = [], onlyReview: boolean = false): Problem[] {
    const selected: Problem[] = [];

    // 1. Add review problems
    if (reviewProblems.length > 0) {
      selected.push(...reviewProblems);
    }

    // If only review, return immediately (after shuffling if needed, but shuffling is done at end)
    if (onlyReview) {
      this.shuffleArray(selected);
      return selected;
    }

    // 2. Add new random problems
    // Avoid duplicates if review problem is also selected randomly
    const reviewQuestions = new Set(selected.map(p => p.question));
    
    const availableProblems = allProblems.filter(
      p => !reviewQuestions.has(p.question)
    );
    this.shuffleArray(availableProblems);

    // Always add QUESTIONS_PER_QUIZ new problems
    const numToAdd = QUESTIONS_PER_QUIZ;
    selected.push(...availableProblems.slice(0, numToAdd));

    // Shuffle final list
    this.shuffleArray(selected);

    return selected;
  }

  getTopIncorrectProblems(limit: number = 5): Array<{
    question: string;
    stat: ProblemStat;
  }> {
    const entries = Object.entries(this.state.problem_stats);
    entries.sort((a, b) => b[1].incorrect_count - a[1].incorrect_count);

    return entries.slice(0, limit).map(([question, stat]) => ({
      question,
      stat,
    }));
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  resetState(): void {
    localStorage.removeItem(this.stateKey);
    this.state = {
      sessions: [],
      problem_stats: {},
    };
    this.currentIterationStats = {
      total_questions: 0,
      correct_first_try: 0,
      total_attempts: 0,
      correct_attempts: 0,
    };
  }
}

export async function loadAllProblems(): Promise<Problem[]> {
  const problemFiles = [
    'chapter6.json',
    'chapter7.json',
    'chapter8.json',
    'chapter9.json',
    'chapter10.json',
    'chapter11.json',
    'chapter12.json',
  ];

  const allProblems: Problem[] = [];
  const baseUrl = import.meta.env.BASE_URL;

  for (const file of problemFiles) {
    try {
      const response = await fetch(`${baseUrl}problems/${file}`);
      if (response.ok) {
        const problems: Problem[] = await response.json();
        allProblems.push(...problems);
      }
    } catch (e) {
      console.error(`Failed to load ${file}:`, e);
    }
  }

  return allProblems;
}

export async function loadProblemsForChapter(chapter: ChapterType): Promise<Problem[]> {
  if (chapter === 'all') {
    return loadAllProblems();
  }

  const chapterInfo = CHAPTER_INFO.find(c => c.id === chapter);
  if (!chapterInfo || !chapterInfo.fileName) {
    return [];
  }

  const baseUrl = import.meta.env.BASE_URL;
  try {
    const response = await fetch(`${baseUrl}problems/${chapterInfo.fileName}`);
    if (response.ok) {
      const problems: Problem[] = await response.json();
      return problems;
    }
  } catch (e) {
    console.error(`Failed to load ${chapterInfo.fileName}:`, e);
  }

  return [];
}

