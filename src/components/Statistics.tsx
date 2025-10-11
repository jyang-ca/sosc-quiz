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
            <hr className="separator-heavy" />

            {iterationCompleted && (
                <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                    <div className="ascii-art">
                        {`
🎉 🎉 🎉 🎉 🎉 🎉 🎉 🎉 🎉 🎉 
   ITERATION COMPLETE!
🎉 🎉 🎉 🎉 🎉 🎉 🎉 🎉 🎉 🎉
`}
                    </div>
                    <p className="text-success" style={{ fontSize: '1.2rem', margin: '1rem 0' }}>
                        You have completed all 100 problems correctly!
                    </p>
                    <p className="text-primary">
                        Starting Iteration {state.iteration}
                    </p>
                    <hr className="separator" />
                </div>
            )}

            <h2 className="text-primary">📊 Quiz Statistics</h2>

            <div className="stats-container">
                <h3 className="text-secondary">Current Session</h3>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Total Questions</div>
                        <div className="stat-value">{currentStats.total_questions}</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-label">First Try Correct</div>
                        <div className="stat-value text-success">{currentStats.correct_first_try}</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-label">First Try Accuracy</div>
                        <div className="stat-value text-success">{firstTryAccuracy.toFixed(1)}%</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-label">Overall Accuracy</div>
                        <div className="stat-value text-primary">{overallAccuracy.toFixed(1)}%</div>
                    </div>
                </div>
            </div>

            <hr className="separator" />

            <div className="stats-container">
                <h3 className="text-secondary">Overall Progress</h3>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Current Iteration</div>
                        <div className="stat-value">{state.iteration}</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-label">Problems Seen</div>
                        <div className="stat-value">{state.seen_problems.length} / {totalProblems}</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-label">Correct Problems</div>
                        <div className="stat-value text-success">{state.correct_problems.length} / {totalProblems}</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-label">Remaining</div>
                        <div className="stat-value text-warning">
                            {totalProblems - state.correct_problems.length}
                        </div>
                    </div>
                </div>

                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    <div className="progress-text">{progress.toFixed(1)}%</div>
                </div>
            </div>

            {state.iteration_stats.length > 0 && (
                <>
                    <hr className="separator" />
                    <div className="stats-container">
                        <h3 className="text-secondary">📜 Previous Iterations</h3>
                        <ul className="stat-list">
                            {state.iteration_stats.slice(-5).reverse().map((stat, idx) => (
                                <li key={idx} className="stat-list-item">
                                    <div>
                                        <span className="text-primary">Iteration {stat.iteration}</span>
                                        {' - '}
                                        <span className="text-dim">
                                            {new Date(stat.completed_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-secondary">
                                            {stat.correct_first_try}/{stat.total_questions} questions
                                        </span>
                                        {' - '}
                                        <span className="text-success">{stat.accuracy.toFixed(1)}% accuracy</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}

            {topIncorrect.length > 0 && (
                <>
                    <hr className="separator" />
                    <div className="stats-container">
                        <h3 className="text-secondary">❗ Most Difficult Problems</h3>
                        <ul className="stat-list">
                            {topIncorrect.map((item, idx) => {
                                const shortQuestion = item.question.length > 80
                                    ? item.question.substring(0, 80) + '...'
                                    : item.question;

                                return (
                                    <li key={idx} className="stat-list-item">
                                        <div>
                                            <span className="text-error">#{idx + 1}</span>
                                            {' - '}
                                            <span className="text-dim">[{item.stat.chapter}]</span>
                                        </div>
                                        <div className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>
                                            {shortQuestion}
                                        </div>
                                        <div style={{ marginTop: '0.3rem' }}>
                                            <span className="text-warning">
                                                Incorrect: {item.stat.incorrect_count} times
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </>
            )}

            <hr className="separator-heavy" />

            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                <p className="text-success" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                    ✅ Quiz completed! All problems answered correctly.
                </p>
                <button className="btn" onClick={onBackToWelcome}>
                    Back to Home
                </button>
            </div>

            <hr className="separator" />

            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p className="text-dim" style={{ fontSize: '0.9rem' }}>
                    👋 Great work! Keep learning!
                </p>
            </div>
        </div>
    );
};

export default Statistics;

