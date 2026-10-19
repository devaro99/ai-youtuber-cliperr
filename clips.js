/*
 * Vercel serverless API.
 * CLIP_API_URL dan CLIP_API_KEY harus ditambahkan pada Vercel Environment Variables.
 * Provider harus mendukung request JSON di bawah; sesuaikan adapter dengan dokumentasi provider.
 * Endpoint ini tidak mengunduh video YouTube sendiri.
 */
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Gunakan method POST." });
  }

  const body = req.body || {};
  const { youtubeUrl, style, duration, subtitles, aspectRatio } = body;
  if (typeof youtubeUrl !== "string" || !isYouTubeUrl(youtubeUrl))
    return res.status(400).json({ message: "URL YouTube tidak valid." });
  if (![30, 45, 60].includes(Number(duration)))
    return res.status(400).json({ message: "Durasi harus 30, 45, atau 60 detik." });
  if (!["podcast", "motivational", "educational", "storytelling"].includes(style))
    return res.status(400).json({ message: "Pilihan gaya tidak valid." });

  const providerUrl = process.env.CLIP_API_URL;
  const providerKey = process.env.CLIP_API_KEY;
  if (!providerUrl || !providerKey) {
    return res.status(503).json({
      message: "Website aktif, tetapi backend AI belum dikonfigurasi. Tambahkan CLIP_API_URL dan CLIP_API_KEY di Vercel → Settings → Environment Variables, lalu redeploy."
    });
  }

  try {
    const providerResponse = await fetch(providerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${providerKey}` },
      body: JSON.stringify({
        youtubeUrl, style, duration: Number(duration),
        subtitles: Boolean(subtitles), aspectRatio: aspectRatio === "9:16" ? "9:16" : "9:16"
      })
    });
    const result = await providerResponse.json().catch(() => ({}));
    if (!providerResponse.ok) {
      return res.status(502).json({ message: result.message || `Provider mengembalikan status ${providerResponse.status}.` });
    }
    return res.status(200).json({
      message: result.message || "Permintaan berhasil dikirim ke provider.",
      jobId: result.jobId || result.id || null,
      status: result.status || "submitted",
      resultUrl: isSafeHttpUrl(result.resultUrl) ? result.resultUrl : null
    });
  } catch (error) {
    console.error("Clip provider request failed:", error.message);
    return res.status(502).json({ message: "Tidak bisa menghubungi provider. Periksa URL provider dan coba lagi." });
  }
};
function isYouTubeUrl(value) {
  try {
    const u = new URL(value);
    return ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtube-nocookie.com"].includes(u.hostname);
  } catch { return false; }
}
function isSafeHttpUrl(value) {
  if (typeof value !== "string") return false;
  try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
}