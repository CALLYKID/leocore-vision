// Replace with your Render backend URL
const API_URL = "https://leocore-vision.onrender.com/analyze-xray";

const uploadInput = document.getElementById("imageUpload");
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");
const infoText = document.getElementById("infoText");

uploadInput.addEventListener("change", async function () {
  const file = this.files[0];
  if (!file) return;

  // Show the image on canvas first
  const img = new Image();
  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  };
  img.src = URL.createObjectURL(file);

  // Upload image to backend
  const formData = new FormData();
  formData.append("file", file);

  infoText.textContent = "Analyzing X-ray, please wait...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Backend error");

    const data = await response.json();

    // Draw backend annotations if returned
    if (data.annotations) {
      data.annotations.forEach((ann) => {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
        ctx.font = "14px Arial";
        ctx.fillStyle = "red";
        ctx.fillText(ann.label, ann.x, ann.y - 5);
      });
    }

    infoText.textContent = data.message || "Analysis complete!";
  } catch (err) {
    console.error(err);
    infoText.textContent = "Error analyzing X-ray.";
  }
});