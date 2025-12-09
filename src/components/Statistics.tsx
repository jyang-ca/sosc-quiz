import { QuizStateManager } from '../quizLogic';

interface StatisticsProps {
    stateManager: QuizStateManager;
    iterationCompleted: boolean;
    onBackToWelcome: () => void;
}

const Statistics = ({
    stateManager,
    iterationCompleted,
    onBackToWelcome,
}: StatisticsProps) => {
    const state = stateManager.getState();
    const currentStats = stateManager.getCurrentIterationStats();

    // Calculate overall stats from sessions
    const totalSessions = state.sessions.length;
    const totalQuestionsAnswered = state.sessions.reduce((acc, s) => acc + s.total_questions, 0);
    const totalScore = state.sessions.reduce((acc, s) => acc + s.score, 0);
    const averageScore = totalSessions > 0 ? (totalScore / totalSessions) : 0;
    const overallAccuracy = totalQuestionsAnswered > 0 ? (totalScore / totalQuestionsAnswered) * 100 : 0;

    const firstTryAccuracy = currentStats.total_questions > 0
        ? (currentStats.correct_first_try / currentStats.total_questions) * 100
        : 0;

    const topIncorrect = stateManager.getTopIncorrectProblems(5);

    return (
        <div>
            {iterationCompleted && (
                <div style={{ margin: '1.5rem 0' }}>
                    <p className="text-success">[SESSION COMPLETE]</p>
                    <p className="text-secondary" style={{ marginTop: '0.5rem' }}>
                        Session saved.
                    </p>
                    <hr className="separator" />
                </div>
            )}

            <div style={{ margin: '1.5rem 0' }}>
                <p className="text-primary">Current Session Results:</p>
                <p style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                    <span className="text-dim">Questions:</span>{' '}
                    <span className="text-secondary">{currentStats.total_questions}</span>
                    {' | '}
                    <span className="text-dim">First-try:</span>{' '}
                    <span className="text-success">{currentStats.correct_first_try}</span>
                    {' '}
                    <span className="text-success">({firstTryAccuracy.toFixed(1)}%)</span>
                </p>
            </div>

            <hr className="separator" />

            <div style={{ margin: '1.5rem 0' }}>
                <p className="text-primary">Overall Progress:</p>
                <p style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                    <span className="text-dim">Total Sessions:</span>{' '}
                    <span className="text-secondary">{totalSessions}</span>
                    {' | '}
                    <span className="text-dim">Avg Score:</span>{' '}
                    <span className="text-success">{averageScore.toFixed(1)}</span>
                    {' | '}
                    <span className="text-dim">Accuracy:</span>{' '}
                    <span className="text-success">{overallAccuracy.toFixed(1)}%</span>
                </p>
            </div>

            {state.sessions.length > 0 && (
                <>
                    <hr className="separator" />
                    <div style={{ margin: '1.5rem 0' }}>
                        <p className="text-dim">Recent Sessions:</p>
                        {state.sessions.slice(-5).reverse().map((session, idx) => (
                            <p key={idx} style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                                <span className="text-dim">#{session.id}:</span>{' '}
                                <span className="text-secondary">
                                    {session.score}/{session.total_questions}
                                </span>
                                {' '}
                                <span className="text-dim">
                                    {new Date(session.timestamp).toLocaleDateString()}
                                </span>
                            </p>
                        ))}
                    </div>
                </>
            )}

            {topIncorrect.length > 0 && (
                <>
                    <hr className="separator" />
                    <div style={{ margin: '1.5rem 0' }}>
                        <p className="text-dim">Most difficult problems:</p>
                        {topIncorrect.map((item, idx) => {
                            const shortQuestion = item.question.length > 60
                                ? item.question.substring(0, 60) + '...'
                                : item.question;

                            return (
                                <p key={idx} style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                                    <span className="text-warning">#{idx + 1}</span>
                                    {' '}
                                    <span className="text-dim">[{item.stat.chapter}]</span>
                                    {' '}
                                    <span className="text-error">x{item.stat.incorrect_count}</span>
                                    <br />
                                    <span className="text-secondary" style={{ fontSize: '0.9rem', marginLeft: '1.5rem' }}>
                                        {shortQuestion}
                                    </span>
                                </p>
                            );
                        })}
                    </div>
                </>
            )}

            <hr className="separator" />

            <div style={{ margin: '2rem 0' }}>
                <p className="text-success" style={{ marginBottom: '1rem' }}>
                    [QUIZ COMPLETE]
                </p>
                <button className="btn" onClick={onBackToWelcome}>
                    &gt; Back to Home
                </button>
            </div>
        </div>
    );
};

export default Statistics;


