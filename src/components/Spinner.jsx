import './Spinner.css';

function Spinner() {
  return (
    <div className="spinner-overlay">
      <div className="spinner" />
      <p className="spinner-text">Loading magical data...</p>
    </div>
  );
}

export default Spinner;
