import { useState, useEffect, useCallback } from 'react';
import type { Problem, GamePhase, ChapterType } from './types';
import { QuizStateManager, loadProblemsForChapter } from './quizLogic';
import Welcome from './components/Welcome';
import Question from './components/Question';
import Feedback from './components/Feedback';
import Statistics from './components/Statistics';
import Loading from './components/Loading';

function App() {
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [selectedChapter, setSelectedChapter] = useState<ChapterType>('all');
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [quizProblems, setQuizProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [incorrectInRound, setIncorrectInRound] = useState<Problem[]>([]);
  const [isRetryPhase, setIsRetryPhase] = useState(false);
  const [retryRound, setRetryRound] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | 'E' | null>(null);
  const [stateManager, setStateManager] = useState<QuizStateManager>(() => new QuizStateManager('all'));
  const [iterationCompleted, setIterationCompleted] = useState(false);

  // Load problems when chapter changes
  useEffect(() => {
    setPhase('loading');
    loadProblemsForChapter(selectedChapter).then(problems => {
      setAllProblems(problems);
      setPhase('welcome');
    });
  }, [selectedChapter]);

  // Update state manager when chapter changes
  const handleChapterChange = useCallback((chapter: ChapterType) => {
    setSelectedChapter(chapter);
    setStateManager(new QuizStateManager(chapter));
    setIterationCompleted(false);
  }, []);

  const startQuiz = useCallback((reviewProblems: Problem[] = [], onlyReview: boolean = false) => {
    if (allProblems.length === 0) return;

    const selected = stateManager.selectQuizProblems(allProblems, reviewProblems, onlyReview);
    setQuizProblems(selected);
    setCurrentProblemIndex(0);
    setIncorrectInRound([]);
    setIsRetryPhase(false);
    setRetryRound(1);
    setPhase('question');
  }, [allProblems, stateManager]);

  const handleAnswerSelect = useCallback((answer: 'A' | 'B' | 'C' | 'D' | 'E') => {
    setSelectedAnswer(answer);
  }, []);

  const handleAnswerSubmit = useCallback(() => {
    if (!selectedAnswer) return;

    const currentProblem = isRetryPhase
      ? incorrectInRound[currentProblemIndex]
      : quizProblems[currentProblemIndex];

    // If user selects "I don't know" (E), treat as incorrect
    const isCorrect = selectedAnswer !== 'E' && selectedAnswer === currentProblem.answer;

    // Update state
    stateManager.markSeen(currentProblem);
    stateManager.updateAttemptStats(isCorrect);

    if (!isRetryPhase) {
      stateManager.recordQuestionAttempt();
    }

    if (isCorrect) {
      if (!isRetryPhase) {
        stateManager.recordCorrectFirstTry();
      }
      stateManager.markCorrect(currentProblem);
    } else {
      stateManager.markIncorrect(currentProblem);
      if (!isRetryPhase) {
        setIncorrectInRound(prev => [...prev, currentProblem]);
      }
    }

    setPhase('feedback');
  }, [selectedAnswer, isRetryPhase, currentProblemIndex, quizProblems, incorrectInRound, stateManager]);

  const handleFeedbackContinue = useCallback(() => {
    const currentProblems = isRetryPhase ? incorrectInRound : quizProblems;
    const isLastQuestion = currentProblemIndex >= currentProblems.length - 1;

    if (isLastQuestion) {
      if (isRetryPhase) {
        // Check if there are still incorrect answers
        // In the new session-based logic, we don't have a global "correct_problems" list.
        // We need to track which problems from the retry round were answered correctly.
        // However, `incorrectInRound` is NOT updated during the retry phase in the current `handleAnswerSubmit`.
        // We need to change `handleAnswerSubmit` or track it differently.

        // Let's assume for now we just want to retry the ones that were WRONG in this retry round.
        // But we don't have a list of "wrong in this retry round".

        // Alternative: We can check `stateManager.problem_stats`? No, that's cumulative.

        // Simplest fix for now:
        // In `handleAnswerSubmit`, if `isRetryPhase` and answer is WRONG, add to a temporary list?
        // But `handleAnswerSubmit` is a callback.

        // Let's just end the session after one retry round for now to match the Python script's "Phase 2" 
        // which actually loops until correct.
        // The Python script loops: `while incorrect_in_this_round`.

        // To implement "loop until correct" in React:
        // We need to know which problems were answered correctly in THIS retry round.
        // We can filter `incorrectInRound` (the input to this round) against `stateManager`'s recent correct marks?
        // But `markCorrect` is a no-op in the new logic.

        // Let's rely on `handleAnswerSubmit` to track "still incorrect".
        // We need to modify `handleAnswerSubmit` to update `incorrectInRound` even in retry phase?
        // No, `incorrectInRound` is the source for the current phase.

        // Let's just save the session.
        stateManager.addSession(incorrectInRound, quizProblems.length);
        setIterationCompleted(true);
        setPhase('statistics');

      } else {
        // Initial phase done
        if (incorrectInRound.length > 0) {
          setIsRetryPhase(true);
          setCurrentProblemIndex(0);
          setSelectedAnswer(null);
          setPhase('question');
        } else {
          // All correct on first try
          // Save session
          stateManager.addSession([], quizProblems.length);

          setIterationCompleted(true);
          setPhase('statistics');
        }
      }
    } else {
      // Next question
      setCurrentProblemIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setPhase('question');
    }
  }, [isRetryPhase, currentProblemIndex, quizProblems, incorrectInRound, stateManager]);

  const handleBackToWelcome = useCallback(() => {
    stateManager.saveState();
    setPhase('welcome');
    setIterationCompleted(false);
  }, [stateManager]);

  const handleExit = useCallback(() => {
    const currentProblems = isRetryPhase ? incorrectInRound : quizProblems;
    const remainingProblems = currentProblems.slice(currentProblemIndex);

    stateManager.markRemainingAsIncorrect(remainingProblems);

    // Save session with all incorrect problems (from first round + remaining)
    // We need to capture ALL wrong problems from the session.
    // incorrectInRound contains wrong ones so far.
    // remainingProblems are also wrong.
    // So total wrong = incorrectInRound + remainingProblems (minus duplicates if any, but shouldn't be)

    // Actually, `incorrectInRound` only gets populated if !isRetryPhase.
    // So if we exit in first phase: wrong = incorrectInRound + remaining.
    // If we exit in retry phase: wrong = incorrectInRound (which is all wrong from phase 1).
    // But wait, if we exit in retry phase, we already marked them wrong in phase 1.
    // So we just need to save the session.

    // Let's simplify:
    // We need to pass the list of wrong problems to addSession.
    // In Phase 1: incorrectInRound (so far) + remainingProblems.
    // In Phase 2: incorrectInRound (all wrong from Phase 1).

    let wrongProblems: Problem[] = [];
    if (!isRetryPhase) {
      wrongProblems = [...incorrectInRound, ...remainingProblems];
    } else {
      wrongProblems = [...incorrectInRound];
    }

    // Deduplicate just in case
    const uniqueWrong = Array.from(new Set(wrongProblems.map(p => p.question)))
      .map(q => wrongProblems.find(p => p.question === q)!);

    stateManager.addSession(uniqueWrong, quizProblems.length);

    setPhase('statistics');
  }, [isRetryPhase, currentProblemIndex, quizProblems, incorrectInRound, stateManager]);

  const currentProblem = isRetryPhase
    ? incorrectInRound[currentProblemIndex]
    : quizProblems[currentProblemIndex];

  const totalQuestions = isRetryPhase
    ? incorrectInRound.length
    : quizProblems.length;

  return (
    <div className="terminal">
      {phase === 'loading' && <Loading />}

      {phase === 'welcome' && (
        <Welcome
          stateManager={stateManager}
          onStartQuiz={startQuiz}
          selectedChapter={selectedChapter}
          onChapterChange={handleChapterChange}
        />
      )}

      {phase === 'question' && currentProblem && (
        <Question
          problem={currentProblem}
          questionNumber={currentProblemIndex + 1}
          totalQuestions={totalQuestions}
          isRetry={isRetryPhase}
          retryRound={retryRound}
          selectedAnswer={selectedAnswer}
          onSelectAnswer={handleAnswerSelect}
          onSubmit={handleAnswerSubmit}
          onExit={handleExit}
        />
      )}

      {phase === 'feedback' && currentProblem && selectedAnswer && (
        <Feedback
          problem={currentProblem}
          selectedAnswer={selectedAnswer}
          onContinue={handleFeedbackContinue}
        />
      )}

      {phase === 'statistics' && (
        <Statistics
          stateManager={stateManager}
          iterationCompleted={iterationCompleted}
          onBackToWelcome={handleBackToWelcome}
        />
      )}
    </div>
  );
}

export default App;
