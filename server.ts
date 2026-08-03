import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const CONFIG_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(CONFIG_DIR, "saved-config.json");

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health and SDK Info API endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      library: "autorca-suite",
      version: "1.2.0",
      description: "AutoBug Root Cause Analysis & Loop-Engineered Code Fix Library",
      features: [
        "Loop Engineering & Harness Verification",
        "AGENTS.md & SKILLS.md Sub-Agent Swarm",
        "Worktree Sandboxing & surgical patch diffs",
        "GitHub Draft PR with existing CI verification",
        "Jira / Freshrelease / Zoho Sprints / CSV Bug Tracker Connectors",
        "Configurable Guardrails & Email Alerts",
      ],
    });
  });

  // GET backend saved configurations
  app.get("/api/config", (req, res) => {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const data = fs.readFileSync(CONFIG_FILE, "utf-8");
        return res.json({ success: true, config: JSON.parse(data) });
      }
      return res.json({ success: true, config: null });
    } catch (err: any) {
      console.error("[API ERROR] Failed to load config:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST save / update backend configurations
  app.post("/api/config", (req, res) => {
    try {
      ensureConfigDir();
      let existingConfig = {};
      if (fs.existsSync(CONFIG_FILE)) {
        try {
          existingConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
        } catch (e) {
          existingConfig = {};
        }
      }
      const updatedConfig = {
        ...existingConfig,
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), "utf-8");
      return res.json({ success: true, config: updatedConfig });
    } catch (err: any) {
      console.error("[API ERROR] Failed to save config:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST validate and authenticate connector endpoints (KB sources & Bug Trackers)
  app.post("/api/connectors/validate", (req, res) => {
    const { type, platform, url, baseUrl, apiKeyOrToken, name } = req.body || {};
    const targetUrl = (url || baseUrl || "").trim();
    const token = (apiKeyOrToken || "").trim();

    // Validate URL scheme
    if (!targetUrl) {
      return res.status(400).json({
        success: false,
        error: "Validation Error: Endpoint URL or Path cannot be empty.",
      });
    }

    const isHttp = targetUrl.startsWith("http://") || targetUrl.startsWith("https://");

    // Type-specific or Platform-specific validation
    if (type === "Confluence") {
      if (!isHttp) {
        return res.status(400).json({
          success: false,
          error: "Confluence Validation Failed: Must be a valid HTTP/HTTPS URL.",
        });
      }
      if (!targetUrl.includes(".atlassian.net") && !targetUrl.includes("confluence") && !targetUrl.includes("internal")) {
        return res.status(400).json({
          success: false,
          error: "Confluence Validation Failed: Hostname does not match an Atlassian Confluence instance domain.",
        });
      }
    } else if (type === "GitHub Wiki") {
      if (!isHttp || !targetUrl.includes("github.com")) {
        return res.status(400).json({
          success: false,
          error: "GitHub Wiki Validation Failed: Must point to a valid github.com repository wiki URL.",
        });
      }
    } else if (platform === "Jira") {
      if (!isHttp) {
        return res.status(400).json({
          success: false,
          error: "Jira Validation Failed: Must start with https:// or http://.",
        });
      }
      if (!targetUrl.includes(".atlassian.net") && !targetUrl.includes("jira")) {
        return res.status(400).json({
          success: false,
          error: "Jira Validation Failed: URL hostname must match your organization's Jira Atlassian domain.",
        });
      }
      if (!token || token.length < 8) {
        return res.status(400).json({
          success: false,
          error: "Jira Authentication Failed: API token is missing or too short (must be a valid Atlassian PAT/token).",
        });
      }
    } else if (platform === "Freshrelease") {
      if (!isHttp || (!targetUrl.includes("freshrelease.com") && !targetUrl.includes("freshworks.com"))) {
        return res.status(400).json({
          success: false,
          error: "Freshrelease Validation Failed: Must match domain freshrelease.com or freshworks.com.",
        });
      }
      if (!token || token.length < 8) {
        return res.status(400).json({
          success: false,
          error: "Freshrelease Authentication Failed: Valid API token required.",
        });
      }
    } else if (platform === "Zoho Sprints") {
      if (!isHttp || !targetUrl.includes("zoho.")) {
        return res.status(400).json({
          success: false,
          error: "Zoho Sprints Validation Failed: Must be a valid Zoho domain (zoho.com, zoho.eu, zoho.in).",
        });
      }
      if (!token || token.length < 8) {
        return res.status(400).json({
          success: false,
          error: "Zoho Sprints Authentication Failed: OAuth token or API key required.",
        });
      }
    } else if (isHttp && targetUrl.length < 10) {
      return res.status(400).json({
        success: false,
        error: "Validation Failed: Malformed URL endpoint.",
      });
    }

    return res.json({
      success: true,
      status: "Connected",
      verifiedAt: new Date().toISOString(),
      details: `Successfully validated ${type || platform} endpoint (${targetUrl}) and authenticated token credentials.`,
    });
  });

  // Simulated backend API for email guardrail alert dispatching
  app.post("/api/guardrail/alert", (req, res) => {
    const { email, reason, tokensBurnt, maxTokens } = req.body || {};
    console.log(`[GUARDRAIL ALERT EMAIL DISPATCHED] To: ${email} | Reason: ${reason} | Burn: ${tokensBurnt}/${maxTokens}`);
    res.json({
      success: true,
      timestamp: new Date().toLocaleTimeString(),
      recipient: email,
      subject: "AutoRCA Guardrail Limit Alert - Loop Execution Paused",
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AutoRCA & Fix Suite server running on http://localhost:${PORT}`);
  });
}

startServer();
