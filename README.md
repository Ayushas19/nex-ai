# NexAI

### One‑click Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

After clicking, select your GitHub repo and Render will detect `render.yaml` to provision the service.

### Manual Deploy (Render)

1. Push this project to GitHub.
2. In Render: New → Web Service → Connect repo.
3. Settings:
   - Build Command: `npm install`
   - Start Command: `npm run start`
4. Environment Variables:
   - `OPENROUTER_API_KEY` = your key
   - Optional: `OPENROUTER_MODEL` = `openrouter/auto` (or any supported model)
5. Wait for deploy → open your Render URL.

Health check: `GET /api/health` should return `openrouterConfigured: true`.

### Local Development

1. Create `.env` in the project root:
   - `OPENROUTER_API_KEY=sk-or-...`
2. Install and run:
   - `npm install`
   - `npm run start`
3. Open `http://localhost:3000`.

