const uploadInput = document.getElementById("imageUpload");
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");
const infoText = document.getElementById("infoText");

const annotations = [
  {
    label: "Right Lung Field",
    x: 100,
    y: 80,
    width: 120,
    height: 200,
    explanation:
      "Radiologists examine lung fields for symmetry, clarity, and unusual opacities."
  },
  {
    label: "Left Lung Field",
    x: 260,
    y: 80,
    width: 120,
    height: 200,
    explanation:
      "The left lung field is assessed for normal air distribution and structural landmarks."
  },
  {
    label: "Cardiac Silhouette",
    x: 190,
    y: 140,
    width: 120,
    height: 120,
    explanation:
      "The cardiac silhouette gives an indication of heart size and position."
  }
];

uploadInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    drawAnnotations();
  };
  img.src = URL.createObjectURL(file);
});

function drawAnnotations() {
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.font = "14px Arial";
  ctx.fillStyle = "red";

  annotations.forEach((ann) => {
    ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
    ctx.fillText(ann.label, ann.x, ann.y - 5);
  });

  infoText.textContent =
    "Annotated regions highlight anatomical areas commonly reviewed by radiologists.";
}

canvas.addEventListener("click", function (e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  annotations.forEach((ann) => {
    if (
      x >= ann.x &&
      x <= ann.x + ann.width &&
      y >= ann.y &&
      y <= ann.y + ann.height
    ) {
      infoText.textContent = ann.explanation;
    }
  });
});