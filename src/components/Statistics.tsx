import { QuizStateManager } from '../quizLogic';

interface StatisticsProps {
    stateManager: QuizStateManager;
    totalProblems: number;
    iterationCompleted: boolean;
    onBackToWelcome: () => void;
}

const Statistics = ({
    stateManager,
    totalProblems,
    iterationCompleted,
    onBackToWelcome,
}: StatisticsProps) => {
    const state = stateManager.getState();
    const currentStats = stateManager.getCurrentIterationStats();

    const progress = totalProblems > 0
        ? (state.correct_problems.length / totalProblems) * 100
        : 0;

    const firstTryAccuracy = currentStats.total_questions > 0
        ? (currentStats.correct_first_try / currentStats.total_questions) * 100
        : 0;

    const overallAccuracy = currentStats.total_attempts > 0
        ? (currentStats.correct_attempts / currentStats.total_attempts) * 100
        : 0;

    const topIncorrect = stateManager.getTopIncorrectProblems(5);

    return (
        <div>
            {iterationCompleted && (
                <div style={{ margin: '1.5rem 0' }}>
                    <p className="text-success">[ITERATION COMPLETE]</p>
                    <p className="text-secondary" style={{ marginTop: '0.5rem' }}>
                        All 100 problems answered correctly. Starting Iteration {state.iteration}
                    </p>
                    <hr className="separator" />
                </div>
            )}

            <div style={{ margin: '1.5rem 0' }}>
                <p className="text-primary">Session Results:</p>
                <p style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                    <span className="text-dim">Questions:</span>{' '}
                    <span className="text-secondary">{currentStats.total_questions}</span>
                    {' | '}
                    <span className="text-dim">First-try:</span>{' '}
                    <span className="text-success">{currentStats.correct_first_try}</span>
                    {' '}
                    <span className="text-success">({firstTryAccuracy.toFixed(1)}%)</span>
                    {' | '}
                    <span className="text-dim">Overall:</span>{' '}
                    <span className="text-primary">{overallAccuracy.toFixed(1)}%</span>
                </p>
            </div>

            <hr className="separator" />

            <div style={{ margin: '1.5rem 0' }}>
                <p className="text-primary">Progress:</p>
                <p style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                    <span className="text-dim">Iteration:</span>{' '}
                    <span className="text-secondary">{state.iteration}</span>
                    {' | '}
                    <span className="text-dim">Correct:</span>{' '}
                    <span className="text-success">{state.correct_problems.length}/{totalProblems}</span>
                    {' '}
                    <span className="text-success">({progress.toFixed(1)}%)</span>
                    {' | '}
                    <span className="text-dim">Remaining:</span>{' '}
                    <span className="text-warning">{totalProblems - state.correct_problems.length}</span>
                </p>
            </div>

            {state.iteration_stats.length > 0 && (
                <>
                    <hr className="separator" />
                    <div style={{ margin: '1.5rem 0' }}>
                        <p className="text-dim">Previous iterations:</p>
                        {state.iteration_stats.slice(-5).reverse().map((stat, idx) => (
                            <p key={idx} style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                                <span className="text-dim">#{stat.iteration}:</span>{' '}
                                <span className="text-secondary">
                                    {stat.correct_first_try}/{stat.total_questions}
                                </span>
                                {' '}
                                <span className="text-success">({stat.accuracy.toFixed(1)}%)</span>
                                {' '}
                                <span className="text-dim">
                                    {new Date(stat.completed_at).toLocaleDateString()}
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


