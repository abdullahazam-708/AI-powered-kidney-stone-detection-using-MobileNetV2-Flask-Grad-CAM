# 🫘 KidneyAI — Automated Kidney Stone Detection System
### Complete User Guide & Documentation

---

## 📌 Table of Contents
1. [What is This Project?](#1-what-is-this-project)
2. [Project File Structure](#2-project-file-structure)
3. [Installation & Setup](#3-installation--setup)
4. [Step 1 — Download the Dataset](#4-step-1--download-the-dataset)
5. [Step 2 — Train the Deep Learning Model](#5-step-2--train-the-deep-learning-model)
6. [Step 3 — Start the API Server](#6-step-3--start-the-api-server)
7. [Step 4 — Open the Website](#7-step-4--open-the-website)
8. [How to Use the Website](#8-how-to-use-the-website-page-by-page)
9. [Understanding the Results](#9-understanding-the-results)
10. [API Reference](#10-api-reference)
11. [Troubleshooting](#11-troubleshooting)
12. [Technical Architecture](#12-technical-architecture)

---

## 1. What is This Project?

**KidneyAI** is an AI-powered medical imaging system that automatically detects and classifies kidney conditions from **CT scan images** using deep learning.

### What it can detect:
| Class | Description | Severity |
|-------|-------------|----------|
| 🔴 **Stone** | Kidney stone (calcification) | High |
| 🟡 **Cyst** | Fluid-filled kidney cyst | Medium |
| 🔴 **Tumor** | Suspicious mass/tumor | Critical |
| 🟢 **Normal** | Healthy kidney | None |

### Technologies Used:
- **MobileNetV2** — Pre-trained deep learning model (Transfer Learning)
- **CLAHE** — Contrast-limited histogram equalization for CT preprocessing
- **Grad-CAM** — Visual heatmap showing WHERE the AI is looking
- **Flask** — Python web server (REST API)
- **HTML/CSS/JS** — Frontend website (no framework needed)

---

## 2. Project File Structure

```
kidney-stone-classifier/
│
├── index.html          ← The website (open this in browser)
├── style.css           ← Website styling
├── app.js              ← Website logic + API connection
│
├── train.py            ← Train the deep learning model
├── server.py           ← Flask API server
├── requirements.txt    ← Python packages needed
├── README.md           ← This file
│
├── dataset/            ← (You create this) CT scan images
│   └── CT-KIDNEY-DATASET-Normal-Cyst-Tumor-Stone/
│       ├── Stone/
│       ├── Normal/
│       ├── Cyst/
│       └── Tumor/
│
└── model/              ← (Auto-created after training)
    ├── kidney_model.h5     ← Trained model weights
    ├── class_names.json    ← Model metadata
    ├── training_history.png
    └── confusion_matrix.png
```

---

## 3. Installation & Setup

### Requirements:
- Python 3.9 or newer
- pip (Python package manager)
- A web browser (Chrome, Firefox, Edge)

### Install Python packages:

Open **PowerShell** and run:

```powershell
cd "e:\Extra work\kidney-stone-classifier"
pip install -r requirements.txt
```

This installs: tensorflow, flask, flask-cors, Pillow, opencv-python, scikit-learn, matplotlib, numpy.

> ⏳ Installation may take 5–10 minutes.

---

## 4. Step 1 — Download the Dataset

### Manual Download:

1. Go to: https://www.kaggle.com/datasets/nazmul0087/ct-kidney-dataset-normal-cyst-tumor-and-stone
2. Click **Download** (free Kaggle account required)
3. Extract the ZIP file
4. Create folder: `kidney-stone-classifier\dataset\`
5. Place extracted folder inside so structure is:

```
dataset/
  CT-KIDNEY-DATASET-Normal-Cyst-Tumor-Stone/
    Stone/      ← ~1377 images
    Normal/     ← ~5077 images
    Cyst/       ← ~3709 images
    Tumor/      ← ~2283 images
```

> 📦 Dataset size: ~1.6 GB, ~12,000 CT scan images

---

## 5. Step 2 — Train the Deep Learning Model

```powershell
cd "e:\Extra work\kidney-stone-classifier"
python train.py
```

### Training Phases:
| Phase | What it does | Duration |
|-------|-------------|----------|
| **Phase 1** | Trains classification head (base frozen) | ~5–10 min |
| **Phase 2** | Fine-tunes top 40 MobileNetV2 layers | ~10–20 min |
| **Evaluation** | Tests accuracy, creates charts | ~2 min |

### Output files saved to `model/` folder:
- `kidney_model.h5` — Trained model
- `class_names.json` — Class labels + accuracy
- `training_history.png` — Accuracy/loss graphs
- `confusion_matrix.png` — Prediction vs actual chart

> 💡 Expected validation accuracy: **95–98%**
> 💡 No GPU? Training still works on CPU but takes ~1–2 hours.

---

## 6. Step 3 — Start the API Server

```powershell
cd "e:\Extra work\kidney-stone-classifier"
python server.py
```

You should see:
```
✅ Model loaded!
🚀 KidneyAI API Server running at http://localhost:5000
```

> ⚠️ Keep this terminal open while using the website.
> 💡 No model trained yet? Server starts in Demo Mode with simulated results.

---

## 7. Step 4 — Open the Website

**Double-click** `index.html` to open in your browser.

OR in Chrome/Firefox press `Ctrl + O` and navigate to the file.

The website works **without** the API server — it uses simulation mode automatically.

---

## 8. How to Use the Website (Page by Page)

### 🏠 Home / Hero Section
- Animated MRI scan visualization
- Live project statistics (accuracy, images, pipeline stages)
- Click **"Launch Demo"** to go to the CT scan analyzer

### 📖 About Section
- Research background and paper abstract
- Feature cards: BPN, FCM, PCA, Accuracy

### 🔄 Pipeline Section
- 5-step visual processing flow:
  `CT Image → CLAHE Preprocessing → FCM Segmentation → PCA Features → BPN Classification`

### 🧠 Algorithms Section
Three interactive tabs with live canvas visualizations:
- **FCM Clustering** — Fuzzy cluster animation
- **PCA Extraction** — Feature scatter plot
- **BPN Network** — Neural network architecture
Click each tab to switch views.

---

### 🔬 Demo Section — CT Scan Analyzer (Main Feature)

#### Step-by-step:

**1. Check API Status bar:**
- 🟢 Green = API online, real model running
- 🟡 Yellow = API connected, demo mode (no model trained yet)
- 🔴 Red = API offline, browser simulation

**2. Upload a CT Scan Image:**

*Method A — Your own CT scan:*
- Click the upload area or **"Browse CT Scan"** button
- Select a JPG/PNG kidney CT scan from your computer
- Preview appears in the box

*Method B — Canvas sample (for testing):*
- Click **Stone**, **Normal**, **Cyst**, or **Tumor** buttons
- A browser-drawn sample appears for demonstration

**3. Click "🔬 Analyze CT Scan":**

Pipeline steps animate one-by-one:
1. ✓ CT Scan Loaded
2. ✓ CLAHE Pre-processing
3. ✓ Resize to 224×224
4. ✓ MobileNetV2 Inference
5. ✓ Grad-CAM Heatmap

**4. View Results** → see Section 9 below.

---

### 📊 Results / Performance Section
- 4 animated accuracy rings
- Bar chart: BPN vs CNN vs SVM vs KNN vs ANN

### 👥 Team Section
- Research team roles and specializations

---

## 9. Understanding the Results

### 🏷️ Result Badge
Large colored label at the top of results:
- 🔴 **RED** = Stone or Tumor (urgent medical attention)
- 🟡 **YELLOW** = Cyst (follow-up recommended)
- 🟢 **GREEN** = Normal (healthy)

Shows: `CONDITION — XX.X% confidence`

### 💊 Medical Advice
Brief clinical recommendation for the detected condition.

> ⚠️ For academic use only. Always see a real doctor!

### 📊 Confidence Bars
Probability scores for all 4 classes (must add up to ~100%):
- **Stone** — probability of kidney stone
- **Normal** — probability of healthy kidney
- **Cyst** — probability of kidney cyst
- **Tumor** — probability of tumor/mass

The longest bar = final AI prediction.

### 🔢 Extracted Image Features
CT image statistics computed during preprocessing:

| Feature | Meaning |
|---------|---------|
| mean_intensity | Average pixel brightness |
| std_dev | Spread of pixel values |
| variance | Intensity variation |
| entropy | Image complexity |
| contrast | Bright vs dark difference |
| brightness | Overall brightness ratio |

### 🔥 Grad-CAM Heatmap
*(Only with real API + real uploaded CT scan)*

Color overlay showing where the AI focused:
- 🔴 **Red/Yellow** = High attention area (where stone/cyst is)
- 🔵 **Blue** = Low attention

This makes the AI **explainable** — verify it's looking at the right spot.

### ⚡ Inference Time
Processing speed in milliseconds (e.g., `Inference: 245ms`)

---

## 10. API Reference

Base URL: `http://localhost:5000`

### `GET /health`
Check server status.
```json
{
  "status": "ok",
  "model_loaded": true,
  "classes": ["Cyst", "Normal", "Stone", "Tumor"],
  "accuracy": 97.4
}
```

### `POST /predict`
Upload CT scan for classification.

**Request:** `multipart/form-data`, field name = `image`

**Response:**
```json
{
  "prediction": "Stone",
  "confidence": 93.2,
  "all_scores": { "Stone": 93.2, "Normal": 3.1, "Cyst": 2.8, "Tumor": 0.9 },
  "description": { "severity": "HIGH", "advice": "...", "icon": "⚠️" },
  "features": { "mean_intensity": 48.3, "entropy": 5.82, ... },
  "gradcam": "<base64 PNG>",
  "inference_ms": 245,
  "demo_mode": false
}
```

### `GET /model-info`
Get model architecture and training details.

---

## 11. Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| 🔴 "API offline" on website | server.py not running | Run `python server.py` in terminal |
| `No module named 'tensorflow'` | Not installed | `pip install tensorflow` |
| `No module named 'cv2'` | Not installed | `pip install opencv-python` |
| Dataset not found in train.py | Wrong folder path | Check folder structure in Section 4 |
| Training is very slow | No GPU | Reduce `BATCH_SIZE = 16` in train.py |
| Blank website | Missing files | Ensure index.html, style.css, app.js are together |
| Grad-CAM not showing | Using canvas sample | Upload a real image file and have API running |
| CORS error in console | API not configured | Make sure you're using server.py (CORS is enabled) |

---

## 12. Technical Architecture

```
User uploads CT Scan
        │
        ▼
┌────────────────────────────────┐
│      Flask API (server.py)     │
│                                │
│  CLAHE Enhancement             │
│  → Resize 224×224              │
│  → Normalize [0,1]             │
│                                │
│  MobileNetV2 Base Model        │
│  (154 layers, ImageNet)        │
│        ↓                       │
│  Custom Head:                  │
│  GlobalAveragePooling2D        │
│  Dense(256) + Dropout(0.4)     │
│  Dense(128) + Dropout(0.3)     │
│  Dense(4, Softmax)             │
│        ↓                       │
│  Grad-CAM Heatmap              │
│  Feature Extraction            │
│        ↓                       │
│  JSON Response                 │
└────────────────────────────────┘
        │
        ▼
┌────────────────────────────────┐
│    Frontend (index.html)       │
│  Confidence bars, Grad-CAM,    │
│  Medical advice, Features      │
└────────────────────────────────┘
```

### Training Strategy:
```
Phase 1 — Feature Extraction:
  MobileNetV2 base: FROZEN
  Learning rate: 0.001 | Epochs: 10

Phase 2 — Fine-Tuning:
  Top 40 layers: UNFROZEN
  Learning rate: 0.00001 | Epochs: 15
  Best model auto-saved via ModelCheckpoint
```

---

## ⚠️ Disclaimer

> This project is for **academic and research purposes only**.
> It is **NOT** a certified medical device.
> **Do NOT** use for actual medical diagnosis.
> Always consult a qualified radiologist or urologist.

---

*KidneyAI Research Project — 2024 | MobileNetV2 + Flask + Grad-CAM*
