import { useState, useEffect, useCallback } from 'react';
import type { Problem, GamePhase } from './types';
import { QuizStateManager, loadAllProblems } from './quizLogic';
import Welcome from './components/Welcome';
import Question from './components/Question';
import Feedback from './components/Feedback';
import Statistics from './components/Statistics';
import Loading from './components/Loading';

function App() {
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [quizProblems, setQuizProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [incorrectInRound, setIncorrectInRound] = useState<Problem[]>([]);
  const [isRetryPhase, setIsRetryPhase] = useState(false);
  const [retryRound, setRetryRound] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [stateManager] = useState(() => new QuizStateManager());
  const [iterationCompleted, setIterationCompleted] = useState(false);

  // Load problems on mount
  useEffect(() => {
    loadAllProblems().then(problems => {
      setAllProblems(problems);
      setPhase('welcome');
    });
  }, []);

  const startQuiz = useCallback(() => {
    if (allProblems.length === 0) return;

    const selected = stateManager.selectQuizProblems(allProblems);
    setQuizProblems(selected);
    setCurrentProblemIndex(0);
    setIncorrectInRound([]);
    setIsRetryPhase(false);
    setRetryRound(1);
    setPhase('question');
  }, [allProblems, stateManager]);

  const handleAnswerSelect = useCallback((answer: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswer(answer);
  }, []);

  const handleAnswerSubmit = useCallback(() => {
    if (!selectedAnswer) return;

    const currentProblem = isRetryPhase
      ? incorrectInRound[currentProblemIndex]
      : quizProblems[currentProblemIndex];

    const isCorrect = selectedAnswer === currentProblem.answer;

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
        const stillIncorrect = incorrectInRound.filter(p => {
          return !stateManager.getState().correct_problems.includes(p.question);
        });

        if (stillIncorrect.length > 0) {
          // Continue retry phase with remaining incorrect
          setIncorrectInRound(stillIncorrect);
          setCurrentProblemIndex(0);
          setRetryRound(prev => prev + 1);
          setSelectedAnswer(null);
          setPhase('question');
        } else {
          // All correct, finalize
          const completed = stateManager.finalizeIteration();
          stateManager.saveState();

          if (completed) {
            setIterationCompleted(true);
          }
          setPhase('statistics');
        }
      } else {
        // Initial phase done, check if retry needed
        if (incorrectInRound.length > 0) {
          setIsRetryPhase(true);
          setCurrentProblemIndex(0);
          setSelectedAnswer(null);
          setPhase('question');
        } else {
          // All correct on first try
          const completed = stateManager.finalizeIteration();
          stateManager.saveState();

          if (completed) {
            setIterationCompleted(true);
          }
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
          totalProblems={allProblems.length}
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
          totalProblems={allProblems.length}
          iterationCompleted={iterationCompleted}
          onBackToWelcome={handleBackToWelcome}
        />
      )}
    </div>
  );
}

export default App;
