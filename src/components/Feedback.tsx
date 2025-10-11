import { useEffect, useCallback } from 'react';
import type { Problem } from '../types';

interface FeedbackProps {
    problem: Problem;
    selectedAnswer: 'A' | 'B' | 'C' | 'D';
    onContinue: () => void;
}

const Feedback = ({ problem, selectedAnswer, onContinue }: FeedbackProps) => {
    const isCorrect = selectedAnswer === problem.answer;

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
            <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="feedback-title">
                    {isCorrect ? (
                        <span className="text-success">✅ Correct!</span>
                    ) : (
                        <span className="text-error">❌ Incorrect</span>
                    )}
                </div>

                <div className="feedback-content">
                    <p>
                        <strong>Your answer:</strong>{' '}
                        <span className={isCorrect ? 'text-success' : 'text-error'}>
                            {selectedAnswer}. {problem.options[selectedAnswer]}
                        </span>
                    </p>

                    {!isCorrect && (
                        <p>
                            <strong>Correct answer:</strong>{' '}
                            <span className="text-success">
                                {problem.answer}. {problem.options[problem.answer]}
                            </span>
                        </p>
                    )}
                </div>

                <div className="feedback-explanation">
                    <p>
                        <strong>📝 Explanation:</strong>
                    </p>
                    <p style={{ marginTop: '0.5rem', lineHeight: '1.8' }}>
                        {problem.related_info}
                    </p>
                </div>
            </div>

            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                <button className="btn" onClick={onContinue} autoFocus>
                    Continue
                </button>
            </div>

            <hr className="separator" />

            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p className="text-dim" style={{ fontSize: '0.9rem' }}>
                    Press Enter or Space to continue
                </p>
            </div>
        </div>
    );
};

export default Feedback;

