import { QuizStateManager, CHAPTER_INFO } from '../quizLogic';
import type { ChapterType } from '../types';

interface WelcomeProps {
    stateManager: QuizStateManager;
    onStartQuiz: () => void;
    totalProblems: number;
    selectedChapter: ChapterType;
    onChapterChange: (chapter: ChapterType) => void;
}

const Welcome = ({ stateManager, onStartQuiz, totalProblems, selectedChapter, onChapterChange }: WelcomeProps) => {
    const state = stateManager.getState();
    const currentChapterInfo = CHAPTER_INFO.find(c => c.id === selectedChapter);

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
                    <span className="text-dim">Iteration:</span>{' '}
                    <span className="text-primary">{state.iteration}</span>
                    {' | '}
                    <span className="text-dim">Correct:</span>{' '}
                    <span className="text-success">{state.correct_problems.length}/{totalProblems}</span>
                    {' | '}
                    <span className="text-dim">Seen:</span>{' '}
                    <span className="text-secondary">{state.seen_problems.length}/{totalProblems}</span>
                    {state.incorrect_problems.length > 0 && (
                        <>
                            {' | '}
                            <span className="text-dim">Incorrect:</span>{' '}
                            <span className="text-warning">{state.incorrect_problems.length}</span>
                        </>
                    )}
                </p>
            </div>

            <div style={{ margin: '2rem 0' }}>
                <button className="btn" onClick={onStartQuiz}>
                    &gt; Start Quiz
                </button>
            </div>

            {state.iteration_stats.length > 0 && (
                <>
                    <hr className="separator" />
                    <div style={{ margin: '1rem 0' }}>
                        <p className="text-dim">Previous:</p>
                        {state.iteration_stats.slice(-5).reverse().map((stat, idx) => (
                            <p key={idx} style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                                <span className="text-dim">#{stat.iteration}:</span>{' '}
                                <span className="text-secondary">
                                    {stat.correct_first_try}/{stat.total_questions}
                                </span>
                                {' '}
                                <span className="text-success">({stat.accuracy.toFixed(1)}%)</span>
                            </p>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Welcome;


