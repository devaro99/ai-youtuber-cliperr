module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const configured = Boolean(process.env.CLIP_API_URL && process.env.CLIP_API_KEY);
  return res.status(200).json({
    ok: true,
    app: "ClipForge AI",
    providerConfigured: configured,
    message: configured ? "Environment provider tersedia." : "Website aktif; provider AI belum dikonfigurasi."
  });
};