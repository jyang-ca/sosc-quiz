const Loading = () => {
  return (
    <div className="loading">
      <div className="ascii-art">
{`
🧠 🧠 🧠 🧠 🧠 🧠 🧠 🧠 🧠 🧠 
Psychology Quiz Application
Progressive Learning System
🧠 🧠 🧠 🧠 🧠 🧠 🧠 🧠 🧠 🧠
`}
      </div>
      <p className="text-primary">Loading problems...</p>
      <div className="spinner"></div>
    </div>
  );
};

export default Loading;

