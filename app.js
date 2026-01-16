const uploadInput = document.getElementById("imageUpload");
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");
const infoText = document.getElementById("infoText");

let annotations = []; // array of {label, x, y, note}

// Upload image and send to backend
uploadInput.addEventListener("change", async function () {
  const file = this.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = async function () {
    // Resize canvas to image size
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    infoText.textContent = "Analyzing image...";

    // Send image to backend
    annotations = await fetchAnnotations(file);

    drawAnnotations();
    infoText.textContent = "Click on arrows or labels to see details.";
  };
  img.src = URL.createObjectURL(file);
});

// Fetch annotations from backend
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

// Draw arrows and labels
function drawAnnotations() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Redraw the image
  const img = new Image();
  img.src = canvas.toDataURL(); // preserve uploaded image
  img.onload = () => {
    ctx.drawImage(img, 0, 0);

    annotations.forEach((ann) => {
      drawArrowToPoint(ann.x, ann.y, ann.label);
    });
  };
}

// Draw an arrow pointing to (x, y) with a label
function drawArrowToPoint(x, y, label) {
  const startX = x + 100; // start arrow slightly offset
  const startY = y - 100;

  // Draw line
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(x, y);
  ctx.stroke();

  // Draw arrowhead
  const headLength = 10;
  const angle = Math.atan2(y - startY, x - startX);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - headLength * Math.cos(angle - Math.PI / 6), y - headLength * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x - headLength * Math.cos(angle + Math.PI / 6), y - headLength * Math.sin(angle + Math.PI / 6));
  ctx.lineTo(x, y);
  ctx.fillStyle = "red";
  ctx.fill();

  // Draw label near arrow start
  ctx.fillStyle = "red";
  ctx.font = "18px Arial";
  ctx.fillText(label, startX + 5, startY - 5);
}

// Handle clicks
canvas.addEventListener("click", function (e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  let clicked = false;
  annotations.forEach((ann) => {
    // detect clicks near arrowhead (20px radius)
    const dx = x - ann.x;
    const dy = y - ann.y;
    if (Math.sqrt(dx * dx + dy * dy) < 20) {
      infoText.textContent = ann.note || ann.label;
      clicked = true;
    }
  });

  if (!clicked) infoText.textContent = "Click on arrows or labels to see details.";
});