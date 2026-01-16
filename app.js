const uploadInput = document.getElementById("imageUpload");
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");
const infoText = document.getElementById("infoText");

let annotations = [];

// Upload image and send to backend
uploadInput.addEventListener("change", async function () {
  const file = this.files[0];
  if (!file) return;

  // Display image on canvas
  const img = new Image();
  img.onload = async function () {
    // Resize canvas to image size
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Send image to backend for analysis
    infoText.textContent = "Analyzing image...";
    annotations = await fetchAnnotations(file);

    // Draw returned annotations
    drawAnnotations();
    infoText.textContent = "Click on boxes to see details.";
  };
  img.src = URL.createObjectURL(file);
});

// Fetch annotations from your backend
async function fetchAnnotations(file) {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch("https://leocore-vision.onrender.com/analyze-xray", {
      method: "POST",
      body: formData
    });
    if (!response.ok) throw new Error("Backend error");
    const data = await response.json();
    return data.annotations || [];
  } catch (err) {
    infoText.textContent = "Error analyzing image: " + err.message;
    return [];
  }
}

// Draw boxes and labels
function drawAnnotations() {
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.font = "18px Arial";
  ctx.fillStyle = "red";

  annotations.forEach((ann) => {
    // Draw rectangle
    ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);

    // Draw label above rectangle
    ctx.fillText(ann.label, ann.x, ann.y - 5);

    // Optional: draw arrow pointing to center of rectangle
    drawArrow(ann.x + ann.width / 2, ann.y + ann.height / 2, ann.x + ann.width / 2, ann.y - 20);
  });
}

// Draw a simple arrow from (fromX, fromY) to (toX, toY)
function drawArrow(fromX, fromY, toX, toY) {
  const headLength = 10;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
  ctx.lineTo(toX, toY);
  ctx.fill();
}

// Handle clicks on annotations
canvas.addEventListener("click", function (e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  let clicked = false;
  annotations.forEach((ann) => {
    if (
      x >= ann.x &&
      x <= ann.x + ann.width &&
      y >= ann.y &&
      y <= ann.y + ann.height
    ) {
      infoText.textContent = ann.note || ann.label;
      clicked = true;
    }
  });

  if (!clicked) infoText.textContent = "Click on boxes to see details.";
});