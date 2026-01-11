from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import opennsfw2
import os

app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"])
def analyze():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]

    # Load image
    image = Image.open(file.stream).convert("RGB")

    # Predict NSFW probability (0.0 = safe, 1.0 = NSFW)
    score = opennsfw2.predict_image(image)

    return jsonify({"score": float(score)})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)
