"""
=============================================================
 KidneyAI — Flask API Server
 Serves the trained MobileNetV2 kidney stone detector
 Run: python server.py
 API: http://localhost:5000
=============================================================
"""

import os, json, io, base64, time
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
import cv2

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf

# ── CONFIG ────────────────────────────────────────────────────────────
MODEL_PATH  = Path('model/kidney_model.h5')
META_PATH   = Path('model/class_names.json')
IMG_SIZE    = (224, 224)

CLASSES     = ['Cyst', 'Normal', 'Stone', 'Tumor']
DESCRIPTIONS = {
    'Stone': {
        'severity': 'HIGH',
        'color': '#ef4444',
        'advice': 'Kidney stone detected. Recommend urological consultation, hydration therapy and possible lithotripsy.',
        'icon': '⚠️'
    },
    'Cyst': {
        'severity': 'MEDIUM',
        'color': '#f59e0b',
        'advice': 'Kidney cyst detected. Recommend follow-up ultrasound and nephrology review.',
        'icon': '⚡'
    },
    'Tumor': {
        'severity': 'CRITICAL',
        'color': '#dc2626',
        'advice': 'Suspicious mass detected. Urgent oncology referral recommended.',
        'icon': '🔴'
    },
    'Normal': {
        'severity': 'LOW',
        'color': '#10b981',
        'advice': 'No abnormality detected. Continue regular check-ups.',
        'icon': '✅'
    }
}

app = Flask(__name__)
CORS(app)

# ── LOAD MODEL ────────────────────────────────────────────────────────
model     = None
meta      = {}

def load_model():
    global model, meta
    if MODEL_PATH.exists():
        print("🔄 Loading trained model...")
        model = tf.keras.models.load_model(str(MODEL_PATH))
        print("✅ Model loaded!")
    else:
        print("⚠️  No trained model found. Using demo mode.")

    if META_PATH.exists():
        with open(META_PATH) as f:
            meta = json.load(f)

# ── PREPROCESSING ─────────────────────────────────────────────────────
def preprocess_image(img_bytes):
    """Preprocess CT scan image for model inference."""
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    orig_size = img.size

    # Apply CLAHE-like enhancement for CT scans
    img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    img_lab = cv2.cvtColor(img_cv, cv2.COLOR_BGR2LAB)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    img_lab[:,:,0] = clahe.apply(img_lab[:,:,0])
    img_enhanced = cv2.cvtColor(img_lab, cv2.COLOR_LAB2BGR)
    img_enhanced = cv2.cvtColor(img_enhanced, cv2.COLOR_BGR2RGB)

    img_pil = Image.fromarray(img_enhanced)
    img_resized = img_pil.resize(IMG_SIZE, Image.LANCZOS)
    arr = np.array(img_resized) / 255.0
    return np.expand_dims(arr, 0), img_pil, orig_size

def generate_gradcam(img_array, class_idx):
    """Generate Grad-CAM heatmap for the predicted class."""
    if model is None:
        return None
    try:
        grad_model = tf.keras.Model(
            inputs=model.inputs,
            outputs=[model.get_layer('Conv_1_bn').output, model.output]
        )
        with tf.GradientTape() as tape:
            conv_out, preds = grad_model(img_array)
            loss = preds[:, class_idx]

        grads = tape.gradient(loss, conv_out)
        pooled = tf.reduce_mean(grads, axis=(0,1,2))
        cam = conv_out[0] @ pooled[..., tf.newaxis]
        cam = tf.squeeze(cam).numpy()
        cam = np.maximum(cam, 0)
        cam = cam / (cam.max() + 1e-8)

        # Resize to 224x224
        cam_resized = cv2.resize(cam, IMG_SIZE)
        heatmap = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)
        heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
        return heatmap
    except Exception:
        return None

def overlay_heatmap(original_img, heatmap, alpha=0.4):
    """Overlay Grad-CAM heatmap on original image."""
    orig = np.array(original_img.resize(IMG_SIZE))
    if heatmap is None:
        return orig
    overlay = (orig * (1 - alpha) + heatmap * alpha).clip(0, 255).astype(np.uint8)
    return overlay

def img_to_b64(arr):
    img = Image.fromarray(arr.astype(np.uint8))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return base64.b64encode(buf.getvalue()).decode()

def extract_features(img_cv):
    """Extract texture/statistical features from CT image."""
    gray = cv2.cvtColor(img_cv, cv2.COLOR_RGB2GRAY)
    return {
        'mean_intensity': round(float(gray.mean()), 2),
        'std_dev':        round(float(gray.std()), 2),
        'variance':       round(float(gray.var()), 2),
        'entropy':        round(float(-np.sum(
            np.histogram(gray, 256)[0]/gray.size *
            np.log2(np.histogram(gray, 256)[0]/gray.size + 1e-10)
        )), 2),
        'contrast':       round(float(gray.max() - gray.min()) / 255, 3),
        'brightness':     round(float(gray.mean()) / 255, 3)
    }

# ── DEMO PREDICTION (no model) ─────────────────────────────────────────
def demo_predict(img_array):
    """Deterministic demo prediction when model not loaded."""
    seed = int(img_array.mean() * 1000) % 4
    probs = [0.05, 0.05, 0.05, 0.05]
    probs[seed] = 0.85
    remainder = 0.15 / 3
    for i in range(4):
        if i != seed:
            probs[i] = remainder
    return np.array([probs])

# ── ROUTES ────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'classes': CLASSES,
        'accuracy': meta.get('best_val_accuracy', 'N/A')
    })

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    start = time.time()
    img_bytes = request.files['image'].read()

    try:
        img_array, img_pil, orig_size = preprocess_image(img_bytes)
    except Exception as e:
        return jsonify({'error': f'Image processing failed: {str(e)}'}), 400

    # Predict
    if model is not None:
        preds = model.predict(img_array, verbose=0)[0]
        demo = False
    else:
        preds = demo_predict(img_array)[0]
        demo = True

    class_idx = int(np.argmax(preds))
    label     = CLASSES[class_idx]
    confidence= float(preds[class_idx]) * 100
    elapsed   = round((time.time() - start) * 1000)

    # Confidence scores
    all_scores = {CLASSES[i]: round(float(preds[i])*100, 1) for i in range(len(CLASSES))}

    # Grad-CAM
    heatmap = generate_gradcam(img_array, class_idx)
    overlay = overlay_heatmap(img_pil, heatmap)

    # Feature extraction
    img_cv = np.array(img_pil.resize(IMG_SIZE))
    features = extract_features(img_cv)

    # Encode overlay image
    overlay_b64 = img_to_b64(overlay)

    result = {
        'prediction': label,
        'confidence': round(confidence, 1),
        'all_scores': all_scores,
        'description': DESCRIPTIONS[label],
        'features': features,
        'gradcam': overlay_b64,
        'inference_ms': elapsed,
        'image_size': list(orig_size),
        'demo_mode': demo,
        'model_accuracy': meta.get('best_val_accuracy', 'N/A')
    }
    return jsonify(result)

@app.route('/model-info', methods=['GET'])
def model_info():
    return jsonify({
        'model': 'MobileNetV2 + Custom Head',
        'input_size': '224x224x3',
        'classes': CLASSES,
        'training': {
            'dataset': 'CT Kidney Dataset (Kaggle)',
            'phase1': 'Feature extraction (frozen base)',
            'phase2': 'Fine-tuning (top 40 layers)',
            'augmentation': 'Rotation, flip, zoom, brightness'
        },
        'accuracy': meta.get('best_val_accuracy', 'Not trained yet'),
        'model_loaded': model is not None
    })

# ── STARTUP ───────────────────────────────────────────────────────────
if __name__ == '__main__':
    load_model()
    print("\n🚀 KidneyAI API Server running at http://localhost:5000")
    print("   POST /predict  — Upload CT scan image")
    print("   GET  /health   — Server status")
    print("   GET  /model-info — Model details\n")
    app.run(host='0.0.0.0', port=5000, debug=False)
