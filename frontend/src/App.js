import React, { useState } from "react";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Inline style objects
  const containerStyle = {
    maxWidth: "600px",
    margin: "2rem auto",
    padding: "2rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
  };

  const headingStyle = {
    marginTop: 0,
    marginBottom: "1rem",
    fontSize: "1.8rem",
    color: "#333",
  };

  const buttonStyle = {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "4px",
    cursor: "pointer",
    margin: "0.5rem",
  };

  const formStyle = {
    marginTop: "1rem",
    marginBottom: "1rem",
  };

  const errorMsgStyle = {
    color: "red",
    marginTop: "1rem",
  };

  const resultContainerStyle = {
    marginTop: "1.5rem",
    backgroundColor: "#fff",
    padding: "1rem",
    borderRadius: "6px",
    border: "1px solid #ddd",
    display: "inline-block",
    textAlign: "left",
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setPrediction(null);
    setConfidence(null);
    setErrorMsg("");
  };

  // Test the /test route (optional check)
  const handleTest = async () => {
    try {
      const res = await fetch("/test");
      if (!res.ok) {
        throw new Error("Failed to fetch /test");
      }
      const data = await res.json();
      alert("Test route says: " + data.message);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Handle form submit -> send file to Flask /predict
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please select a file first!");
      return;
    }
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Error: ${response.statusText}`);
      }

      const data = await response.json();
      setPrediction(data.prediction);
      setConfidence(data.confidence);
    } catch (err) {
      setErrorMsg("Server error: " + err.message);
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Monkeypox Detection Demo</h1>

      <button onClick={handleTest} style={buttonStyle}>
        Test /test route
      </button>

      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ marginRight: "0.5rem" }}
        />
        <button type="submit" style={buttonStyle}>
          Predict
        </button>
      </form>

      {errorMsg && <p style={errorMsgStyle}>{errorMsg}</p>}

      {prediction && (
        <div style={resultContainerStyle}>
          <h2>Prediction: {prediction}</h2>
          <p>Confidence: {confidence}%</p>
        </div>
      )}
    </div>
  );
}

export default App;