import React, { useState, useRef } from "react";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [photoCaptured, setPhotoCaptured] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
    deleteButton: {
      backgroundColor: "#dc3545",
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
    toggleRow: {
      marginTop: "1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    video: {
      width: "100%",
      borderRadius: "8px",
      marginTop: "1rem",
    },
  };

  const startCamera = async () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        stopCamera();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      setShowCamera(true);
      setPhotoCaptured(false);

      // wait a little to make sure the video element has mounted
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera", error);
      setErrorMsg("Unable to access camera. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "captured.png", { type: "image/png" });
          setSelectedFile(file);
          setPreviewSrc(URL.createObjectURL(blob));
          setPrediction(null);
          setConfidence(null);
          setFadeIn(true);
          stopCamera();
          setPhotoCaptured(true);
        }
      }, "image/png");
    }
  };

  const handleDeletePhoto = () => {
    setSelectedFile(null);
    setPreviewSrc("");
    setPhotoCaptured(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewSrc(file ? URL.createObjectURL(file) : "");
    setPrediction(null);
    setConfidence(null);
    setErrorMsg("");
    setFadeIn(true);
    stopCamera();
    setPhotoCaptured(true);
  };

  const speakResult = (prediction, confidence) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    let message = "";

    if (prediction === "Monkeypox") {
      message = `Warning. Monkeypox detected with ${confidence} percent confidence. Please consult a healthcare provider.`;
    } else {
      message = `Monkeypox not detected. Confidence level is ${confidence} percent.`;
    }

    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please select or capture a photo first!");
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
      speakResult(data.prediction, data.confidence);
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
    stopCamera();
    setPhotoCaptured(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1>Monkeypox AI Detection & Info</h1>
      </div>

      <div style={styles.container}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📤 Upload Image or Capture Photo</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <label>📂 Upload from device:</label><br />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={styles.input}
              />
              <br />
              <label>📸 Take a photo:</label><br />
              {!showCamera && !photoCaptured && (
                <button type="button" style={styles.button} onClick={startCamera}>
                  Open Camera
                </button>
              )}
              {showCamera && (
                <div>
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={styles.video}
                  ></video>
                  <br />
                  <button type="button" style={styles.button} onClick={capturePhoto}>
                    Capture Photo
                  </button>
                  <button type="button" style={{ ...styles.button, backgroundColor: "#dc3545" }} onClick={stopCamera}>
                    Close Camera
                  </button>
                  <canvas ref={canvasRef} style={{ display: "none" }} width="640" height="480"></canvas>
                </div>
              )}
            </div>

            {photoCaptured && !showCamera && (
              <div style={{ marginTop: "1rem" }}>
                <button type="button" style={styles.button} onClick={startCamera}>
                  Retake Photo
                </button>
                <button type="button" style={{ ...styles.button, ...styles.deleteButton }} onClick={handleDeletePhoto}>
                  Delete Photo
                </button>
              </div>
            )}

            <button type="submit" style={styles.button}>
              Predict
            </button>
            <button type="button" onClick={handleReset} style={{ ...styles.button, ...styles.resetButton }}>
              Reset
            </button>
          </form>

          <div style={styles.toggleRow}>
            <input
              type="checkbox"
              id="voiceToggle"
              checked={voiceEnabled}
              onChange={() => setVoiceEnabled(!voiceEnabled)}
            />
            <label htmlFor="voiceToggle">Enable voice feedback</label>
          </div>

          {errorMsg && <p style={styles.errorMsg}>{errorMsg}</p>}

          {previewSrc && (
            <img src={previewSrc} alt="Captured" style={styles.previewImage} />
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
      </div>

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
