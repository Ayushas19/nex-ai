import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from .env first, then api.env (without overriding existing env)
const envPathDefault = path.join(__dirname, ".env");
const envPathAlt = path.join(__dirname, "api.env");
dotenv.config({ path: envPathDefault });
dotenv.config({ path: envPathAlt, override: false });
console.log("Env probe:", {
  __dirname,
  envPathDefaultExists: fs.existsSync(envPathDefault),
  envPathAltExists: fs.existsSync(envPathAlt)
});

app.use(express.json());
app.use(express.static(__dirname));

// Handle malformed JSON bodies with a clear JSON response
app.use((err, _req, res, next) => {
  if (err && err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: { message: "Invalid JSON in request body", detail: err.message } });
  }
  return next(err);
});

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openrouter/auto";
if (!OPENROUTER_API_KEY) {
  console.warn("Warning: OPENROUTER_API_KEY is not set. Set it before starting the server.");
} else {
  const masked = OPENROUTER_API_KEY.length > 12
    ? OPENROUTER_API_KEY.slice(0, 6) + "..." + OPENROUTER_API_KEY.slice(-4)
    : "<set>";
  console.log("OpenRouter API key loaded:", masked);
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: { message: "'message' is required" } });
    }

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: { message: "OPENROUTER_API_KEY is not configured on the server" } });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        Accept: "application/json",
        "HTTP-Referer": "http://localhost:3000/",
        "X-Title": "NexAI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: "user", content: message }
        ]
      })
    });

    const status = response.status || 500;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return res.status(status >= 200 && status < 300 ? 200 : status).json(data);
    } else {
      const textBody = await response.text().catch(() => "<non-readable body>");
      console.error("OpenRouter non-JSON response", { status, contentType, bodyPreview: textBody.slice(0, 1000) });
      return res.status(status).json({
        error: {
          message: "OpenRouter returned a non-JSON response",
          status,
          contentType,
          body: textBody.slice(0, 4000)
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ error: { message: err && err.message ? err.message : "Server error" } });
  }
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.HTML"));
});

// Simple health endpoint to verify server sees the key
app.get("/api/health", (_req, res) => {
  const key = process.env.OPENROUTER_API_KEY || "";
  res.json({
    openrouterConfigured: Boolean(key),
    keyPreview: key ? (key.length > 12 ? key.slice(0, 6) + "..." + key.slice(-4) : "<set>") : "<missing>",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


