from flask import Flask, request, jsonify
from PIL import Image
import opennsfw2

app = Flask(__name__)

@app.route("/analyze", methods=["POST"])
def analyze():
    file = request.files["image"]

    # Load image
    image = Image.open(file.stream).convert("RGB")

    # Predict NSFW probability (0.0 → safe, 1.0 → NSFW)
    score = opennsfw2.predict_image(image)

    return jsonify({"score": float(score)})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001)
