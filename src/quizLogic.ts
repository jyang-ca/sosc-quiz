// Quiz logic ported from Python implementation

import type {
  Problem,
  QuizState,
  ProblemStat,
  CurrentIterationStats,
} from './types';

const STATE_KEY = 'psychology_quiz_state';
const QUESTIONS_PER_QUIZ = 20;

export class QuizStateManager {
  private state: QuizState;
  private currentIterationStats: CurrentIterationStats;

  constructor() {
    this.state = this.loadState();
    this.currentIterationStats = {
      total_questions: 0,
      correct_first_try: 0,
      total_attempts: 0,
      correct_attempts: 0,
    };
  }

  private loadState(): QuizState {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load state:', e);
      }
    }
    
    return {
      incorrect_problems: [],
      seen_problems: [],
      correct_problems: [],
      iteration: 0,
      iteration_stats: [],
      problem_stats: {},
    };
  }

  saveState(): void {
    this.state.last_updated = new Date().toISOString();
    localStorage.setItem(STATE_KEY, JSON.stringify(this.state));
  }

  getState(): QuizState {
    return { ...this.state };
  }

  getCurrentIterationStats(): CurrentIterationStats {
    return { ...this.currentIterationStats };
  }

  markSeen(problem: Problem): void {
    if (!this.state.seen_problems.includes(problem.question)) {
      this.state.seen_problems.push(problem.question);
    }
  }

  markCorrect(problem: Problem): void {
    const question = problem.question;
    
    if (!this.state.correct_problems.includes(question)) {
      this.state.correct_problems.push(question);
    }

    // Remove from incorrect list
    this.state.incorrect_problems = this.state.incorrect_problems.filter(
      p => p.question !== question
    );
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

    // Add to incorrect list if not already there
    const exists = this.state.incorrect_problems.some(
      p => p.question === question
    );

    if (!exists) {
      this.state.incorrect_problems.push({ ...problem });
    }
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

  finalizeIteration(): boolean {
    const totalProblems = this.state.seen_problems.length;
    const correctProblems = this.state.correct_problems.length;

    // Check if all problems have been answered correctly
    if (correctProblems >= 100 && totalProblems >= 100) {
      // Save iteration stats
      this.state.iteration_stats.push({
        iteration: this.state.iteration,
        completed_at: new Date().toISOString(),
        total_questions: this.currentIterationStats.total_questions,
        correct_first_try: this.currentIterationStats.correct_first_try,
        accuracy:
          this.currentIterationStats.total_questions > 0
            ? (this.currentIterationStats.correct_first_try /
                this.currentIterationStats.total_questions) *
              100
            : 0,
      });

      // Increment iteration
      this.state.iteration += 1;

      // Reset for next iteration
      this.state.correct_problems = [];
      this.state.seen_problems = [];
      this.state.incorrect_problems = [];

      // Reset current iteration stats
      this.currentIterationStats = {
        total_questions: 0,
        correct_first_try: 0,
        total_attempts: 0,
        correct_attempts: 0,
      };

      this.saveState();
      return true;
    }

    // Reset current iteration stats for next session
    this.currentIterationStats = {
      total_questions: 0,
      correct_first_try: 0,
      total_attempts: 0,
      correct_attempts: 0,
    };

    return false;
  }

  selectQuizProblems(allProblems: Problem[]): Problem[] {
    const selected: Problem[] = [];

    // 1. Select from incorrect problems first
    if (this.state.incorrect_problems.length > 0) {
      const availableIncorrect = [...this.state.incorrect_problems];
      this.shuffleArray(availableIncorrect);

      const numFromIncorrect = Math.min(
        availableIncorrect.length,
        QUESTIONS_PER_QUIZ
      );
      selected.push(...availableIncorrect.slice(0, numFromIncorrect));
    }

    // 2. Fill remaining with unseen problems
    let remaining = QUESTIONS_PER_QUIZ - selected.length;
    if (remaining > 0) {
      const unseen = allProblems.filter(
        p => !this.state.seen_problems.includes(p.question)
      );
      this.shuffleArray(unseen);

      const numFromUnseen = Math.min(unseen.length, remaining);
      selected.push(...unseen.slice(0, numFromUnseen));
    }

    // 3. If still not enough, fill with seen problems
    remaining = QUESTIONS_PER_QUIZ - selected.length;
    if (remaining > 0) {
      const selectedQuestions = new Set(selected.map(p => p.question));
      const seenButNotSelected = allProblems.filter(
        p =>
          this.state.seen_problems.includes(p.question) &&
          !selectedQuestions.has(p.question)
      );
      this.shuffleArray(seenButNotSelected);
      selected.push(...seenButNotSelected.slice(0, remaining));
    }

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
    localStorage.removeItem(STATE_KEY);
    this.state = {
      incorrect_problems: [],
      seen_problems: [],
      correct_problems: [],
      iteration: 0,
      iteration_stats: [],
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
    'chapter2.json',
    'chapter4.json',
    'chapter5.json',
    'chapter6.json',
    'chapter9.json',
  ];

  const allProblems: Problem[] = [];

  for (const file of problemFiles) {
    try {
      const response = await fetch(`/problems/${file}`);
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

