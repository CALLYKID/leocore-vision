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
    # Read image
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("L")
    width, height = image.size

    # Example: return **fake educational annotations**
    # Replace this with your external API call later
    annotations = [
        {"label": "Humerus", "x": int(width*0.3), "y": int(height*0.5), "note": "Upper arm bone"},
        {"label": "Radius", "x": int(width*0.5), "y": int(height*0.7), "note": "Forearm bone"},
        {"label": "Ulna", "x": int(width*0.6), "y": int(height*0.7), "note": "Forearm bone"}
        # Add as many as you want for demonstration
    ]

    return {"annotations": annotations}
