# ClipForge AI — YouTube Clip Extractor

Starter website with HTML/CSS/JavaScript frontend and Vercel serverless API.

## Upload to GitHub
Upload all files and folders from this project into the ROOT of your repository, preserving the `api` folder.

## Deploy
Import the repository into Vercel (or redeploy the connected project). Framework preset: Other. No build command or output directory is required for this static frontend and serverless API.

## Enable an authorized clipping provider
In Vercel → Project → Settings → Environment Variables, add:
- `CLIP_API_URL`: HTTPS endpoint of a provider that accepts the request schema below.
- `CLIP_API_KEY`: private bearer token for that provider.

Redeploy after setting variables. The provider must support a JSON POST body:
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=...",
  "style": "podcast",
  "duration": 45,
  "subtitles": true,
  "aspectRatio": "9:16"
}
```
Expected example response:
```json
{
  "jobId": "job_123",
  "status": "processing",
  "message": "Request accepted",
  "resultUrl": "https://provider.example/result.mp4"
}
```
Adjust `api/clips.js` to match the actual provider API and authentication docs. Async status polling is not implemented in this starter.

## Supabase
`config.js` has empty public configuration placeholders for a future Supabase integration. This starter does NOT currently write to `clip_jobs`. Never expose a Supabase service-role key in frontend code. Before connecting the table, verify its columns and Row Level Security policies.

## Endpoints
- `GET /api/health`: checks whether provider environment variables are present.
- `POST /api/clips`: validates the request and forwards it to the configured provider.

## Important
The UI can be deployed without a provider, but real highlight detection, video processing, subtitles, storage, and result status depend on a compatible authorized backend provider. Use videos you own or have permission to process and follow applicable platform/provider terms.
