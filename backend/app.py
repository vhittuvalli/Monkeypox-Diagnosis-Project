from flask import Flask, request, jsonify
from fastai.vision.all import load_learner, PILImage
import logging

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

# Path to your Fast.ai model file
MODEL_PATH = "model.pkl"

# Attempt to load the model
try:
    logging.info("Loading Fast.ai model from %s", MODEL_PATH)
    learner = load_learner(MODEL_PATH)
    logging.info("Model loaded successfully!")
except Exception as e:
    logging.exception("Failed to load model!")
    raise e

@app.route("/test", methods=["GET"])
def test_route():
    """
    Simple test route to confirm Flask is running.
    Example: visit http://127.0.0.1:5000/test in your browser.
    """
    logging.debug("GET /test called.")
    return jsonify({"message": "Test route is working!"}), 200

@app.route("/predict", methods=["POST"])
def predict():
    """
    Receives an image file via form-data with the key 'file'.
    Runs the Fast.ai model prediction and returns JSON.
    """
    logging.debug("POST /predict called.")

    # Check if 'file' is in the request
    if 'file' not in request.files:
        logging.error("No 'file' key found in request.files")
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        logging.error("Filename is empty")
        return jsonify({"error": "Empty filename"}), 400

    try:
        # Convert uploaded file to a PIL image
        logging.debug("Converting uploaded file to PIL image...")
        img = PILImage.create(file)

        # Run prediction
        logging.debug("Running learner.predict...")
        pred_class, pred_idx, probs = learner.predict(img)
        logging.debug("Prediction success: class=%s", str(pred_class))

        # Return JSON
        return jsonify({
            "prediction": str(pred_class),
            "confidence": round(float(probs[pred_idx]) * 100, 2)
        }), 200

    except Exception as e:
        logging.exception("Error during prediction")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)

