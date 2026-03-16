import { useState, useEffect, useCallback } from 'react';
import type { Problem, GamePhase, ChapterType, QuizAnswer } from './types';
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
  const [retryProblems, setRetryProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [firstRoundIncorrect, setFirstRoundIncorrect] = useState<Problem[]>([]);
  const [incorrectInRetryRound, setIncorrectInRetryRound] = useState<Problem[]>([]);
  const [isRetryPhase, setIsRetryPhase] = useState(false);
  const [retryRound, setRetryRound] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<QuizAnswer | null>(null);
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

    stateManager.resetCurrentIterationStats();
    const selected = stateManager.selectQuizProblems(allProblems, reviewProblems, onlyReview);
    setQuizProblems(selected);
    setRetryProblems([]);
    setCurrentProblemIndex(0);
    setFirstRoundIncorrect([]);
    setIncorrectInRetryRound([]);
    setIsRetryPhase(false);
    setRetryRound(1);
    setSelectedAnswer(null);
    setIterationCompleted(false);
    setPhase('question');
  }, [allProblems, stateManager]);

  const handleAnswerSelect = useCallback((answer: QuizAnswer) => {
    setSelectedAnswer(answer);
  }, []);

  const handleAnswerSubmit = useCallback(() => {
    if (!selectedAnswer) return;

    const currentProblem = isRetryPhase
      ? retryProblems[currentProblemIndex]
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
      if (isRetryPhase) {
        setIncorrectInRetryRound(prev => [...prev, currentProblem]);
      } else {
        setFirstRoundIncorrect(prev => [...prev, currentProblem]);
      }
    }

    setPhase('feedback');
  }, [
    selectedAnswer,
    isRetryPhase,
    currentProblemIndex,
    quizProblems,
    retryProblems,
    stateManager,
  ]);

  const handleFeedbackContinue = useCallback(() => {
    const currentProblems = isRetryPhase ? retryProblems : quizProblems;
    const isLastQuestion = currentProblemIndex >= currentProblems.length - 1;

    if (isLastQuestion) {
      if (isRetryPhase) {
        if (incorrectInRetryRound.length > 0) {
          setRetryProblems(incorrectInRetryRound);
          setIncorrectInRetryRound([]);
          setCurrentProblemIndex(0);
          setSelectedAnswer(null);
          setRetryRound(prev => prev + 1);
          setPhase('question');
        } else {
          stateManager.addSession(firstRoundIncorrect, quizProblems.length);
          setIterationCompleted(true);
          setPhase('statistics');
        }
      } else {
        // Initial phase done
        if (firstRoundIncorrect.length > 0) {
          setIsRetryPhase(true);
          setRetryProblems(firstRoundIncorrect);
          setIncorrectInRetryRound([]);
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
  }, [
    currentProblemIndex,
    firstRoundIncorrect,
    incorrectInRetryRound,
    isRetryPhase,
    quizProblems,
    retryProblems,
    stateManager,
  ]);

  const handleBackToWelcome = useCallback(() => {
    stateManager.saveState();
    setPhase('welcome');
    setIterationCompleted(false);
  }, [stateManager]);

  const handleExit = useCallback(() => {
    const currentProblems = isRetryPhase ? retryProblems : quizProblems;
    const remainingProblems = currentProblems.slice(currentProblemIndex);

    stateManager.markRemainingAsIncorrect(remainingProblems, !isRetryPhase);

    let wrongProblems: Problem[] = [];
    if (!isRetryPhase) {
      wrongProblems = [...firstRoundIncorrect, ...remainingProblems];
    } else {
      wrongProblems = [...firstRoundIncorrect];
    }

    // Deduplicate just in case
    const uniqueWrong = Array.from(new Set(wrongProblems.map(p => p.question)))
      .map(q => wrongProblems.find(p => p.question === q)!);

    stateManager.addSession(uniqueWrong, quizProblems.length);

    setPhase('statistics');
  }, [currentProblemIndex, firstRoundIncorrect, isRetryPhase, quizProblems, retryProblems, stateManager]);

  const currentProblem = isRetryPhase
    ? retryProblems[currentProblemIndex]
    : quizProblems[currentProblemIndex];

  const totalQuestions = isRetryPhase
    ? retryProblems.length
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
