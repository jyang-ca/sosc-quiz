import { useEffect, useCallback } from 'react';
import type { Problem } from '../types';

interface QuestionProps {
    problem: Problem;
    questionNumber: number;
    totalQuestions: number;
    isRetry: boolean;
    retryRound: number;
    selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
    onSelectAnswer: (answer: 'A' | 'B' | 'C' | 'D') => void;
    onSubmit: () => void;
}

const Question = ({
    problem,
    questionNumber,
    totalQuestions,
    isRetry,
    retryRound,
    selectedAnswer,
    onSelectAnswer,
    onSubmit,
}: QuestionProps) => {
    const options: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const currentIndex = selectedAnswer ? options.indexOf(selectedAnswer) : -1;
                const nextIndex = (currentIndex + 1) % options.length;
                onSelectAnswer(options[nextIndex]);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const currentIndex = selectedAnswer ? options.indexOf(selectedAnswer) : options.length;
                const prevIndex = (currentIndex - 1 + options.length) % options.length;
                onSelectAnswer(options[prevIndex]);
            } else if (e.key === 'Enter' && selectedAnswer) {
                e.preventDefault();
                onSubmit();
            }
        },
        [selectedAnswer, onSelectAnswer, onSubmit]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div>
            <div className="question-header">
                <div className="question-meta">
                    <span className="text-primary">
                        Question {questionNumber}/{totalQuestions}
                        {isRetry && ` [Retry Round ${retryRound}]`}
                    </span>
                    {' • '}
                    <span className="text-dim">{problem.chapter}</span>
                </div>
                <hr className="separator" />
            </div>

            <div className="question-text">
                {problem.question}
            </div>

            <ul className="option-list">
                {options.map(option => (
                    <li
                        key={option}
                        className={`option-item ${selectedAnswer === option ? 'selected' : ''}`}
                        onClick={() => onSelectAnswer(option)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onSelectAnswer(option);
                            }
                        }}
                    >
                        <strong>{option}.</strong> {problem.options[option]}
                    </li>
                ))}
            </ul>

            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                <button
                    className="btn"
                    onClick={onSubmit}
                    disabled={!selectedAnswer}
                >
                    Submit Answer {selectedAnswer && `(${selectedAnswer})`}
                </button>
            </div>

            <hr className="separator" />

            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p className="text-dim" style={{ fontSize: '0.9rem' }}>
                    Use ↑↓ arrow keys to navigate • Enter to submit
                </p>
            </div>
        </div>
    );
};

export default Question;

