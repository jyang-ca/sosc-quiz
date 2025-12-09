import { QuizStateManager, CHAPTER_INFO } from '../quizLogic';
import type { ChapterType } from '../types';

interface WelcomeProps {
    stateManager: QuizStateManager;
    onStartQuiz: (reviewProblems?: any[], onlyReview?: boolean) => void;
    selectedChapter: ChapterType;
    onChapterChange: (chapter: ChapterType) => void;
}

import { useState } from 'react';

const Welcome = ({ stateManager, onStartQuiz, selectedChapter, onChapterChange }: WelcomeProps) => {
    const state = stateManager.getState();
    const currentChapterInfo = CHAPTER_INFO.find(c => c.id === selectedChapter);
    const [selectedSessions, setSelectedSessions] = useState<number[]>([]);

    const sessionsWithWrong = state.sessions.filter(s => s.wrong_problems.length > 0);

    const toggleSession = (sessionId: number) => {
        setSelectedSessions(prev =>
            prev.includes(sessionId)
                ? prev.filter(id => id !== sessionId)
                : [...prev, sessionId]
        );
    };

    const handleStartWithReview = () => {
        const reviewProblems = state.sessions
            .filter(s => selectedSessions.includes(s.id))
            .flatMap(s => s.wrong_problems);

        // Deduplicate problems based on question text
        const uniqueReviewProblems = Array.from(new Set(reviewProblems.map(p => p.question)))
            .map(q => reviewProblems.find(p => p.question === q)!);

        onStartQuiz(uniqueReviewProblems, true);
    };

    return (
        <div>
            <div className="ascii-art">
                {`$ psychology-quiz`}
            </div>

            <div style={{ margin: '1.5rem 0' }}>
                <p className="text-dim" style={{ marginBottom: '0.75rem' }}>Select Chapter:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {CHAPTER_INFO.map(chapter => (
                        <button
                            key={chapter.id}
                            className={selectedChapter === chapter.id ? 'btn' : 'btn-secondary'}
                            onClick={() => onChapterChange(chapter.id)}
                            style={{
                                fontSize: '0.85rem',
                                padding: '0.4rem 0.8rem',
                            }}
                        >
                            {chapter.id === 'all' ? '🎯 ' : ''}{chapter.title}
                        </button>
                    ))}
                </div>
            </div>

            <hr className="separator" />

            <div style={{ margin: '1.5rem 0' }}>
                <p style={{ marginBottom: '0.5rem' }}>
                    <span className="text-primary" style={{ fontSize: '1.1rem' }}>
                        {currentChapterInfo?.title}
                    </span>
                </p>
                <p>
                    <span className="text-dim">Total Sessions:</span>{' '}
                    <span className="text-primary">{state.sessions.length}</span>
                </p>
            </div>

            <div style={{ margin: '2rem 0', display: 'flex', gap: '1rem' }}>
                <button className="btn" onClick={() => onStartQuiz([])}>
                    &gt; Start New Quiz
                </button>
            </div>

            {sessionsWithWrong.length > 0 && (
                <>
                    <hr className="separator" />
                    <div style={{ margin: '1rem 0' }}>
                        <p className="text-dim" style={{ marginBottom: '1rem' }}>Review Wrong Answers:</p>

                        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
                            {sessionsWithWrong.slice().reverse().map(session => (
                                <div
                                    key={session.id}
                                    onClick={() => toggleSession(session.id)}
                                    style={{
                                        padding: '0.5rem',
                                        marginBottom: '0.5rem',
                                        cursor: 'pointer',
                                        border: selectedSessions.includes(session.id) ? '1px solid #4af626' : '1px solid #333',
                                        borderRadius: '4px',
                                        backgroundColor: selectedSessions.includes(session.id) ? 'rgba(74, 246, 38, 0.1)' : 'transparent'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="text-secondary">Session #{session.id}</span>
                                        <span className="text-dim">{new Date(session.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                        <span className="text-warning">{session.wrong_problems.length} wrong</span>
                                        {' | '}
                                        <span className="text-dim">Score: {session.score}/{session.total_questions}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            className="btn-secondary"
                            onClick={handleStartWithReview}
                            disabled={selectedSessions.length === 0}
                        >
                            &gt; Review Session ({selectedSessions.length} sessions)
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Welcome;


