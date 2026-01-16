const imageUpload = document.getElementById("imageUpload");
const analyzeBtn = document.getElementById("analyzeBtn");
const previewImage = document.getElementById("previewImage");
const resultText = document.getElementById("resultText");

// Your Render backend URL
const BACKEND_URL = "https://leocore-vision.onrender.com/analyze-xray";

let selectedFile = null;

imageUpload.addEventListener("change", (e) => {
  selectedFile = e.target.files[0];
  if (!selectedFile) return;

  previewImage.src = URL.createObjectURL(selectedFile);
});

analyzeBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    alert("Please upload an X-ray image first.");
    return;
  }

  resultText.textContent = "Analyzing...";

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    resultText.textContent = JSON.stringify(data, null, 2);

  } catch (err) {
    resultText.textContent = `Analysis failed: ${err.message}`;
  }
});