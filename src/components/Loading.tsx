const Loading = () => {
  return (
    <div className="loading">
      <div className="ascii-art">
        {`$ psychology-quiz`}
      </div>
      <p className="text-dim" style={{ marginTop: '1rem' }}>Loading problems...</p>
      <div className="spinner"></div>
    </div>
  );
};

export default Loading;

