import { useEffect, useCallback } from 'react';
import type { Problem } from '../types';

interface FeedbackProps {
    problem: Problem;
    selectedAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
    onContinue: () => void;
}

const Feedback = ({ problem, selectedAnswer, onContinue }: FeedbackProps) => {
    const isCorrect = selectedAnswer !== 'E' && selectedAnswer === problem.answer;

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onContinue();
            }
        },
        [onContinue]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div>
            <div style={{ margin: '1rem 0' }}>
                <p>
                    {isCorrect ? (
                        <span className="text-success">[CORRECT]</span>
                    ) : (
                        <span className="text-error">[INCORRECT]</span>
                    )}
                </p>
            </div>

            <div style={{ margin: '1.5rem 0' }}>
                <p>
                    <span className="text-dim">Your answer:</span>{' '}
                    <span className={isCorrect ? 'text-success' : 'text-error'}>
                        {selectedAnswer === 'E' ? (
                            <>E. I don't know</>
                        ) : (
                            <>{selectedAnswer}. {problem.options[selectedAnswer]}</>
                        )}
                    </span>
                </p>

                {!isCorrect && (
                    <p style={{ marginTop: '0.5rem' }}>
                        <span className="text-dim">Correct:</span>{' '}
                        <span className="text-success">
                            {problem.answer}. {problem.options[problem.answer]}
                        </span>
                    </p>
                )}
            </div>

            <hr className="separator" />

            <div style={{ margin: '1.5rem 0', lineHeight: '1.8' }}>
                <p className="text-dim">Explanation:</p>
                <p className="text-secondary" style={{ marginTop: '0.5rem' }}>
                    {problem.related_info}
                </p>
                <p className="text-dim" style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>
                    [Lecture Slide: {problem.chapter}]
                </p>
            </div>

            <div style={{ margin: '2rem 0' }}>
                <button className="btn" onClick={onContinue} autoFocus>
                    &gt; Continue
                </button>
            </div>
        </div>
    );
};

export default Feedback;

