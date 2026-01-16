from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import cv2
import io

app = FastAPI(title="LeoVision Backend")

# Allow frontend (Vercel) to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def root():
    return {"status": "LeoVision backend running"}

@app.post("/analyze-xray")
async def analyze_xray(file: UploadFile = File(...)):
    # Read the uploaded image
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("L")  # grayscale
    image_np = np.array(image)

    # Basic image processing (educational)
    # 1. Edge detection
    edges = cv2.Canny(image_np, 50, 150)

    # 2. Image statistics
    mean_intensity = float(np.mean(image_np))
    edge_density = float(np.sum(edges > 0) / edges.size)

    return {
        "image_stats": {
            "mean_intensity": mean_intensity,
            "edge_density": edge_density
        },
        "note": "This is an educational analysis only; not medical advice."
    }
