
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: "ai-youtube-clipper",
    providerConfigured: Boolean(
      process.env.CLIP_API_URL && process.env.CLIP_API_KEY
    )
  });
}
