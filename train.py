"""
=============================================================
 KidneyAI — Deep Learning Model Training Script
 Dataset : CT KIDNEY DATASET (Normal / Cyst / Tumor / Stone)
 Model   : MobileNetV2 Transfer Learning + Custom Head
 Author  : KidneyAI Research
=============================================================

SETUP INSTRUCTIONS:
1. Download the dataset from Kaggle:
   https://www.kaggle.com/datasets/nazmul0087/ct-kidney-dataset-normal-cyst-tumor-and-stone

   OR run:  kaggle datasets download -d nazmul0087/ct-kidney-dataset-normal-cyst-tumor-and-stone

2. Extract to:  ./dataset/
   Expected structure:
   dataset/
     CT-KIDNEY-DATASET-Normal-Cyst-Tumor-Stone/
       Normal/
       Cyst/
       Tumor/
       Stone/

3. Run:  python train.py
"""

import os
import json
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

import tensorflow as tf
from tensorflow.keras import layers, models, optimizers, callbacks
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

# ── CONFIG ────────────────────────────────────────────────────────────
IMG_SIZE    = (224, 224)
BATCH_SIZE  = 32
EPOCHS_FEAT = 10      # Phase 1: train head only
EPOCHS_FINE = 15      # Phase 2: fine-tune top layers
NUM_CLASSES = 4
CLASSES     = ['Cyst', 'Normal', 'Stone', 'Tumor']
MODEL_DIR   = Path('model')
MODEL_PATH  = MODEL_DIR / 'kidney_model.h5'
HISTORY_PATH= MODEL_DIR / 'history.json'
CLASS_PATH  = MODEL_DIR / 'class_names.json'

DATASET_ROOT = Path('dataset/CT-KIDNEY-DATASET-Normal-Cyst-Tumor-Stone')

# ── VERIFY DATASET ────────────────────────────────────────────────────
def verify_dataset():
    if not DATASET_ROOT.exists():
        print("\n❌ Dataset not found!")
        print("📥 Download from Kaggle:")
        print("   https://www.kaggle.com/datasets/nazmul0087/ct-kidney-dataset-normal-cyst-tumor-and-stone")
        print("\nPlace extracted folder at:", DATASET_ROOT)
        print("\nAlternative: Run 'kaggle datasets download -d nazmul0087/ct-kidney-dataset-normal-cyst-tumor-and-stone'")
        exit(1)

    counts = {}
    total  = 0
    for cls in CLASSES:
        path = DATASET_ROOT / cls
        if path.exists():
            n = len(list(path.glob('*.jpg')) + list(path.glob('*.png')) + list(path.glob('*.jpeg')))
            counts[cls] = n
            total += n
    print(f"\n✅ Dataset found! Total images: {total}")
    for cls, n in counts.items():
        print(f"   {cls:10s}: {n} images")
    return counts

# ── DATA GENERATORS ───────────────────────────────────────────────────
def create_generators():
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2,
        rotation_range=20,
        width_shift_range=0.15,
        height_shift_range=0.15,
        shear_range=0.1,
        zoom_range=0.15,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2],
        fill_mode='nearest'
    )
    val_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )

    train_gen = train_datagen.flow_from_directory(
        DATASET_ROOT,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        shuffle=True,
        classes=CLASSES
    )
    val_gen = val_datagen.flow_from_directory(
        DATASET_ROOT,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        shuffle=False,
        classes=CLASSES
    )
    return train_gen, val_gen

# ── BUILD MODEL ───────────────────────────────────────────────────────
def build_model():
    base = MobileNetV2(
        input_shape=(*IMG_SIZE, 3),
        include_top=False,
        weights='imagenet'
    )
    base.trainable = False   # Freeze base

    inputs = tf.keras.Input(shape=(*IMG_SIZE, 3))
    x = base(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dense(256, activation='relu')(x)
    x = layers.Dropout(0.4)(x)
    x = layers.Dense(128, activation='relu')(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(NUM_CLASSES, activation='softmax')(x)

    model = models.Model(inputs, outputs)
    model.compile(
        optimizer=optimizers.Adam(1e-3),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    print("\n✅ Model built:")
    model.summary()
    return model, base

# ── CALLBACKS ─────────────────────────────────────────────────────────
def get_callbacks(phase):
    return [
        callbacks.ModelCheckpoint(
            str(MODEL_PATH), monitor='val_accuracy',
            save_best_only=True, verbose=1
        ),
        callbacks.EarlyStopping(
            monitor='val_accuracy', patience=5,
            restore_best_weights=True, verbose=1
        ),
        callbacks.ReduceLROnPlateau(
            monitor='val_loss', factor=0.5,
            patience=3, min_lr=1e-7, verbose=1
        ),
        callbacks.CSVLogger(str(MODEL_DIR / f'training_log_{phase}.csv'))
    ]

# ── PLOT HISTORY ──────────────────────────────────────────────────────
def plot_history(hist1, hist2=None):
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    fig.suptitle('KidneyAI Training History', fontsize=14, fontweight='bold')

    for ax, metric, title in zip(axes, ['accuracy','loss'], ['Accuracy','Loss']):
        # Phase 1
        ax.plot(hist1.history[metric],       label='Train (Phase 1)',  color='steelblue')
        ax.plot(hist1.history[f'val_{metric}'], label='Val (Phase 1)', color='steelblue', linestyle='--')
        if hist2:
            offset = len(hist1.history[metric])
            ax.plot(range(offset, offset+len(hist2.history[metric])),
                    hist2.history[metric], label='Train (Fine-tune)', color='darkorange')
            ax.plot(range(offset, offset+len(hist2.history[f'val_{metric}'])),
                    hist2.history[f'val_{metric}'], label='Val (Fine-tune)', color='darkorange', linestyle='--')
        ax.set_title(title); ax.set_xlabel('Epoch'); ax.legend(); ax.grid(alpha=0.3)

    plt.tight_layout()
    plt.savefig(str(MODEL_DIR / 'training_history.png'), dpi=150)
    print("📊 Training plot saved to model/training_history.png")
    plt.close()

# ── EVALUATE ──────────────────────────────────────────────────────────
def evaluate(model, val_gen):
    print("\n📋 Evaluating on validation set...")
    val_gen.reset()
    preds = model.predict(val_gen, verbose=1)
    y_pred = np.argmax(preds, axis=1)
    y_true = val_gen.classes

    print("\n=== Classification Report ===")
    print(classification_report(y_true, y_pred, target_names=CLASSES))

    cm = confusion_matrix(y_true, y_pred)
    fig, ax = plt.subplots(figsize=(8,6))
    im = ax.imshow(cm, cmap='Blues')
    ax.set_xticks(range(NUM_CLASSES)); ax.set_yticks(range(NUM_CLASSES))
    ax.set_xticklabels(CLASSES, rotation=45); ax.set_yticklabels(CLASSES)
    ax.set_xlabel('Predicted'); ax.set_ylabel('True')
    ax.set_title('Confusion Matrix — KidneyAI')
    for i in range(NUM_CLASSES):
        for j in range(NUM_CLASSES):
            ax.text(j,i,cm[i,j],ha='center',va='center',
                    color='white' if cm[i,j]>cm.max()//2 else 'black', fontweight='bold')
    plt.colorbar(im); plt.tight_layout()
    plt.savefig(str(MODEL_DIR / 'confusion_matrix.png'), dpi=150)
    print("📊 Confusion matrix saved to model/confusion_matrix.png")
    plt.close()

    val_loss, val_acc = model.evaluate(val_gen, verbose=0)
    return val_acc

# ── SAVE METADATA ─────────────────────────────────────────────────────
def save_metadata(hist1, hist2, val_acc):
    all_acc = hist1.history['val_accuracy']
    if hist2:
        all_acc += hist2.history['val_accuracy']
    metadata = {
        'classes': CLASSES,
        'num_classes': NUM_CLASSES,
        'img_size': list(IMG_SIZE),
        'val_accuracy': round(float(val_acc)*100, 2),
        'best_val_accuracy': round(max(all_acc)*100, 2),
        'model_file': 'kidney_model.h5'
    }
    with open(CLASS_PATH,'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"\n✅ Metadata saved → model/class_names.json")
    print(f"🏆 Best Val Accuracy: {metadata['best_val_accuracy']}%")

# ── MAIN ──────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  KidneyAI — Deep Learning Training Pipeline")
    print("=" * 60)

    MODEL_DIR.mkdir(exist_ok=True)
    verify_dataset()

    # Save class names immediately
    with open(CLASS_PATH,'w') as f:
        json.dump({'classes': CLASSES, 'img_size': list(IMG_SIZE)}, f)

    train_gen, val_gen = create_generators()
    model, base = build_model()

    # ── Phase 1: Train classification head ──────────────────────────
    print("\n🚀 Phase 1: Training classification head...")
    hist1 = model.fit(
        train_gen,
        epochs=EPOCHS_FEAT,
        validation_data=val_gen,
        callbacks=get_callbacks('phase1'),
        verbose=1
    )

    # ── Phase 2: Fine-tune top 40 layers of base ────────────────────
    print("\n🔧 Phase 2: Fine-tuning top layers...")
    base.trainable = True
    # Freeze all layers except the last 40
    for layer in base.layers[:-40]:
        layer.trainable = False

    model.compile(
        optimizer=optimizers.Adam(1e-5),   # Lower LR for fine-tuning
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    hist2 = model.fit(
        train_gen,
        epochs=EPOCHS_FINE,
        validation_data=val_gen,
        callbacks=get_callbacks('phase2'),
        verbose=1
    )

    # ── Load best weights & evaluate ────────────────────────────────
    model.load_weights(str(MODEL_PATH))
    plot_history(hist1, hist2)
    val_acc = evaluate(model, val_gen)
    save_metadata(hist1, hist2, val_acc)

    print("\n" + "="*60)
    print("  ✅ Training Complete!")
    print(f"  Model saved → {MODEL_PATH}")
    print("  Start API   → python server.py")
    print("="*60)

if __name__ == '__main__':
    main()
