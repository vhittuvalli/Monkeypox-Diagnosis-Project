import React, { useState } from "react";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

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

      // Use a relative path -> CRA dev server proxies to Flask
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
    <div style={{ margin: "2rem" }}>
      <h1>Monkeypox Detection Demo</h1>
      <button onClick={handleTest}>Test /test route</button>
      <br /><br />
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit">Predict</button>
      </form>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {prediction && (
        <div>
          <h2>Prediction: {prediction}</h2>
          <p>Confidence: {confidence}%</p>
        </div>
      )}
    </div>
  );
}

export default App;