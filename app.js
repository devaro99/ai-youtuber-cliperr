(() => {
  const $ = (id) => document.getElementById(id);
  const form = $("clip-form");
  const urlInput = $("youtube-url");
  const durationInput = $("duration");
  const statusBox = $("status-box");
  const resultBox = $("result-box");
  const submitBtn = $("submit-btn");
  const submitLabel = $("submit-label");

  document.querySelectorAll(".duration-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".duration-btn").forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      durationInput.value = button.dataset.duration;
    });
  });

  $("paste-btn").addEventListener("click", async () => {
    try {
      if (!navigator.clipboard?.readText) throw new Error("Clipboard tidak tersedia");
      const value = await navigator.clipboard.readText();
      if (value) urlInput.value = value.trim();
      else showStatus("Clipboard kosong. Salin link YouTube dahulu, lalu tekan Tempel.", "error");
    } catch {
      urlInput.focus();
      showStatus("Browser tidak mengizinkan clipboard. Tempel link secara manual pada kolom.", "error");
    }
  });

  function showStatus(message, type = "") {
    statusBox.textContent = message;
    statusBox.className = `status-box ${type}`.trim();
  }

  function validYouTubeUrl(value) {
    try {
      const parsed = new URL(value);
      return ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtube-nocookie.com"].includes(parsed.hostname);
    } catch { return false; }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusBox.className = "status-box hidden";
    resultBox.className = "result-box hidden";
    const youtubeUrl = urlInput.value.trim();
    if (!validYouTubeUrl(youtubeUrl)) {
      showStatus("Masukkan URL YouTube yang valid.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitLabel.textContent = "Menghubungkan...";
    showStatus("Memeriksa koneksi backend…");

    const payload = {
      youtubeUrl,
      style: $("style").value,
      duration: Number(durationInput.value),
      subtitles: $("subtitles").checked,
      aspectRatio: "9:16"
    };

    try {
      const response = await fetch(window.APP_CONFIG?.apiEndpoint || "/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Backend belum siap. Periksa pengaturan Vercel.");
      showStatus(data.message || "Permintaan diterima oleh backend.", "success");
      if (data.jobId || data.status || data.resultUrl) {
        resultBox.className = "result-box";
        const title = document.createElement("div");
        title.className = "result-title";
        title.textContent = "Status pemrosesan";
        const details = document.createElement("div");
        details.textContent = `Status: ${data.status || "submitted"}${data.jobId ? ` · Job ID: ${data.jobId}` : ""}`;
        resultBox.replaceChildren(title, details);
        if (data.resultUrl) {
          const link = document.createElement("a");
          link.className = "result-link";
          link.href = data.resultUrl;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = "Buka hasil klip";
          resultBox.appendChild(link);
        }
      }
    } catch (error) {
      showStatus(error.message || "Terjadi kesalahan saat menghubungi backend.", "error");
    } finally {
      submitBtn.disabled = false;
      submitLabel.textContent = "Analisis video";
    }
  });
})();