import { useEffect, useCallback } from 'react';
import type { Problem } from '../types';

interface QuestionProps {
    problem: Problem;
    questionNumber: number;
    totalQuestions: number;
    isRetry: boolean;
    retryRound: number;
    selectedAnswer: 'A' | 'B' | 'C' | 'D' | 'E' | null;
    onSelectAnswer: (answer: 'A' | 'B' | 'C' | 'D' | 'E') => void;
    onSubmit: () => void;
    onExit: () => void;
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
    onExit,
}: QuestionProps) => {
    const options: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E'];

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
            <div style={{ marginBottom: '1.5rem' }}>
                <p>
                    <span className="text-primary">
                        [{questionNumber}/{totalQuestions}]
                        {isRetry && ` retry-${retryRound}`}
                    </span>
                    {' '}
                    <span className="text-dim">{problem.chapter}</span>
                </p>
            </div>

            <div style={{ margin: '1rem 0', lineHeight: '1.8' }}>
                <p className="text-secondary">{problem.question}</p>
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
                        {option === 'E' ? (
                            <>E. I don't know (Repeat this problem)</>
                        ) : (
                            <>{option}. {problem.options[option]}</>
                        )}
                    </li>
                ))}
            </ul>

            <div style={{ margin: '2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    className="btn"
                    onClick={onSubmit}
                    disabled={!selectedAnswer}
                >
                    &gt; Submit {selectedAnswer && `(${selectedAnswer})`}
                </button>

                <button
                    className="btn"
                    onClick={onExit}
                    style={{
                        backgroundColor: 'transparent',
                        color: '#666',
                        border: '1px solid #666',
                        fontSize: '0.9rem',
                        padding: '0.5rem 1rem'
                    }}
                >
                    Exit Quiz
                </button>
            </div>
        </div>
    );
};

export default Question;

