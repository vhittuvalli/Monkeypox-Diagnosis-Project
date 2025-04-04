import React, { useState } from "react";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const styles = {
    page: {
      fontFamily: "Segoe UI, sans-serif",
      background: "linear-gradient(to right, #eef2f3, #8e9eab)",
      minHeight: "100vh",
      paddingBottom: "3rem",
    },
    header: {
      position: "sticky",
      top: 0,
      backgroundColor: "#fff",
      padding: "1rem 0",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      textAlign: "center",
      zIndex: 100,
    },
    container: {
      maxWidth: "800px",
      margin: "2rem auto",
      padding: "2rem",
      backgroundColor: "#ffffffcc",
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
      transition: "all 0.5s ease-in-out",
      animation: fadeIn ? "fade-in 1s ease-in-out" : "none",
    },
    section: {
      marginBottom: "3rem",
    },
    sectionTitle: {
      fontSize: "1.6rem",
      marginBottom: "1rem",
      borderBottom: "2px solid #007bff",
      paddingBottom: "0.3rem",
    },
    input: {
      marginBottom: "1rem",
    },
    button: {
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      padding: "0.6rem 1.2rem",
      borderRadius: "4px",
      cursor: "pointer",
      margin: "0.5rem",
      transition: "background-color 0.3s",
    },
    resetButton: {
      backgroundColor: "#6c757d",
    },
    buttonHover: {
      backgroundColor: "#0056b3",
    },
    previewImage: {
      maxWidth: "100%",
      maxHeight: "300px",
      borderRadius: "8px",
      marginTop: "1rem",
      border: "1px solid #ddd",
    },
    resultContainer: (prediction) => ({
      marginTop: "1.5rem",
      backgroundColor: "#fff",
      padding: "1rem",
      borderRadius: "6px",
      border: `2px solid ${prediction === "Monkeypox" ? "#dc3545" : "#28a745"}`,
      color: prediction === "Monkeypox" ? "#dc3545" : "#28a745",
      transition: "all 0.5s ease",
    }),
    progressBarContainer: {
      height: "10px",
      backgroundColor: "#eee",
      borderRadius: "5px",
      marginTop: "0.5rem",
      overflow: "hidden",
    },
    progressBar: (confidence) => ({
      width: `${confidence}%`,
      height: "100%",
      backgroundColor: "#007bff",
    }),
    errorMsg: {
      color: "red",
      marginTop: "1rem",
    },
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewSrc(file ? URL.createObjectURL(file) : "");
    setPrediction(null);
    setConfidence(null);
    setErrorMsg("");
    setFadeIn(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please select a file first!");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);
    setFadeIn(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewSrc("");
    setPrediction(null);
    setConfidence(null);
    setErrorMsg("");
    setIsLoading(false);
    setFadeIn(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1>Monkeypox AI Detection & Info</h1>
      </div>

      <div style={styles.container}>
        {/* Upload + Detection Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📤 Upload Image for Detection</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={styles.input}
            />
            <br />
            <button type="submit" style={styles.button}>
              Predict
            </button>
            <button type="button" onClick={handleReset} style={{ ...styles.button, ...styles.resetButton }}>
              Reset
            </button>
          </form>

          {errorMsg && <p style={styles.errorMsg}>{errorMsg}</p>}
          {previewSrc && (
            <img src={previewSrc} alt="Preview" style={styles.previewImage} />
          )}
          {isLoading && <p>🔄 Predicting... please wait</p>}
          {prediction && (
            <div style={styles.resultContainer(prediction)}>
              <h3>Prediction Result</h3>
              <p>
                {prediction === "Monkeypox"
                  ? "⚠️ Monkeypox detected. Please consult a healthcare professional."
                  : "✅ No signs of monkeypox. If you're unsure, consult a doctor."}
              </p>
              <p>Confidence: {confidence}%</p>
              <div style={styles.progressBarContainer}>
                <div style={styles.progressBar(confidence)}></div>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🧠 About Monkeypox</h2>
          <p>
            Monkeypox is a rare viral disease that belongs to the same family as smallpox. Though
            usually less severe, it can still cause serious symptoms and requires proper medical
            attention.
          </p>
          <ul>
            <li>📍 First detected in 1958 in monkeys</li>
            <li>🤒 Symptoms: fever, rash, swollen lymph nodes</li>
            <li>🧬 Transmission: animal-to-human and human-to-human contact</li>
            <li>💉 Vaccines and antivirals are available for prevention & treatment</li>
            <li>🌍 Recent outbreaks reported in multiple countries</li>
          </ul>
          <p>
            For detailed info, visit{" "}
            <a
              href="https://www.cdc.gov/poxvirus/monkeypox/"
              target="_blank"
              rel="noreferrer"
            >
              CDC Monkeypox Resource
            </a>
          </p>
        </div>
      </div>

      {/* Simple fade animation keyframe */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        button:hover {
          filter: brightness(1.1);
        }

        a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

export default App;
