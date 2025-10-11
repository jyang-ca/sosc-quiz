import { QuizStateManager } from '../quizLogic';

interface WelcomeProps {
    stateManager: QuizStateManager;
    onStartQuiz: () => void;
    totalProblems: number;
}

const Welcome = ({ stateManager, onStartQuiz, totalProblems }: WelcomeProps) => {
    const state = stateManager.getState();
    const progress = totalProblems > 0 ? (state.correct_problems.length / totalProblems) * 100 : 0;

    return (
        <div>
            <div className="ascii-art">
                {`
🧠 🧠 🧠 🧠 🧠 🧠 🧠 🧠 🧠 🧠 
Psychology Quiz Application
Progressive Learning System
🧠 🧠 🧠 🧠 🧠 🧠 🧠 🧠 🧠 🧠
`}
            </div>

            <hr className="separator-heavy" />

            <div className="stats-container">
                <h2 className="text-primary">📊 Current Progress</h2>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Iteration</div>
                        <div className="stat-value">{state.iteration}</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-label">Problems Seen</div>
                        <div className="stat-value">{state.seen_problems.length} / {totalProblems}</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-label">Correct Answers</div>
                        <div className="stat-value">{state.correct_problems.length} / {totalProblems}</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-label">Incorrect Problems</div>
                        <div className="stat-value text-warning">{state.incorrect_problems.length}</div>
                    </div>
                </div>

                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    <div className="progress-text">{progress.toFixed(1)}%</div>
                </div>
            </div>

            <hr className="separator-heavy" />

            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                <h3 className="text-primary">Ready to start?</h3>
                <p className="text-secondary" style={{ margin: '1rem 0' }}>
                    You will answer 20 questions. Incorrect answers will be retested until all are correct.
                </p>
                <button className="btn" onClick={onStartQuiz}>
                    Start Quiz
                </button>
            </div>

            {state.iteration_stats.length > 0 && (
                <>
                    <hr className="separator" />
                    <div>
                        <h3 className="text-primary">📜 Previous Iterations</h3>
                        <ul className="stat-list">
                            {state.iteration_stats.slice(-5).reverse().map((stat, idx) => (
                                <li key={idx} className="stat-list-item">
                                    <span className="text-primary">Iteration {stat.iteration}</span>
                                    {' - '}
                                    <span className="text-secondary">
                                        {stat.correct_first_try}/{stat.total_questions}
                                    </span>
                                    {' - '}
                                    <span className="text-success">{stat.accuracy.toFixed(1)}%</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}

            <hr className="separator" />

            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p className="text-dim" style={{ fontSize: '0.9rem' }}>
                    Use arrow keys ↑↓ or click to select answers • Press Enter or click Submit
                </p>
            </div>
        </div>
    );
};

export default Welcome;

