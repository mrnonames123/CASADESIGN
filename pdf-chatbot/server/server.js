import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

import { loadPDF } from "./services/pdfLoader.js"
import { chunkText } from "./services/chunkText.js"
import { findRelevantChunks } from "./services/textSearch.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure we always load `pdf-chatbot/server/.env` even when started from repo root.
dotenv.config({ path: path.join(__dirname, ".env") })

const app = express()

app.use(cors())
app.use(express.json())

// Groq (OpenAI-compatible) setup
const MODEL_NAME = (process.env.GROQ_MODEL || "llama-3.1-8b-instant").trim() || "llama-3.1-8b-instant"
const apiKey = (process.env.GROQ_API_KEY || "").trim()
const GROQ_API_URL = (process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions").trim()

if (!apiKey) {
  console.warn("⚠️ Missing GROQ_API_KEY. Add `GROQ_API_KEY=...` to pdf-chatbot/server/.env and restart.")
}

const CONTACT_EMAIL = (process.env.CONTACT_EMAIL || "studio@casadesign.ai").trim() || "studio@casadesign.ai"
const FALLBACK_REPLY = `Please check out the website or please email us on "${CONTACT_EMAIL}".`

let pdfChunks = []
let isPdfReady = false
let pdfLoadError = ""
let pdfFilesLoaded = []

async function initialize() {
  try {
    const text = await loadPDF()
    pdfChunks = chunkText(text)
    isPdfReady = true
    pdfLoadError = ""

    // Derive the loaded file list from the injected SOURCE headers (keeps pdfLoader API simple).
    pdfFilesLoaded = Array.from(text.matchAll(/--- SOURCE: (.+?) ---/g)).map((m) => m[1])

    console.log("✅ PDF Loaded Successfully:", pdfFilesLoaded.length ? pdfFilesLoaded.join(", ") : "(unknown)")
  } catch (error) {
    isPdfReady = false
    pdfLoadError = error?.message || String(error)
    pdfFilesLoaded = []
    throw error
  }
}

initialize().catch((error) => {
  console.error("🔥 Failed to initialize PDF:", error)
  process.exit(1)
})

console.log("🤖 Groq model:", MODEL_NAME)

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    provider: "groq",
    model: MODEL_NAME,
    pdfReady: isPdfReady,
    pdfFiles: pdfFilesLoaded,
    pdfError: pdfLoadError || null,
    hasApiKey: Boolean(apiKey)
  })
})

async function groqComplete({ messages, temperature = 0.2, maxTokens = 700 }) {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages,
      temperature,
      max_tokens: maxTokens
    })
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      `Groq request failed (${res.status}).`
    const err = new Error(message)
    err.status = res.status
    err.details = data
    throw err
  }

  const content = data?.choices?.[0]?.message?.content
  return typeof content === "string" ? content : ""
}

app.post("/chat", async (req, res) => {
  try {
    const question = req.body?.question

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        error: "Question is required and must be a non-empty string."
      })
    }

    if (!isPdfReady) {
      return res.status(503).json({
        error: pdfLoadError
          ? `PDF failed to load: ${pdfLoadError}`
          : "PDF is still loading. Please try again in a moment."
      })
    }

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing GROQ_API_KEY. Add it to pdf-chatbot/server/.env (or Render env vars) and restart the server."
      })
    }

    console.log("🟢 Question:", question)

    const relevant = findRelevantChunks(question, pdfChunks)

    if (!relevant.length) {
      return res.json({ answer: FALLBACK_REPLY })
    }

    const context = relevant.join("\n")

    console.log("🟡 Context:", context)

    const prompt = `
Answer ONLY using the context below.
If the answer is not in the context, respond with exactly this sentence (and nothing else):
${FALLBACK_REPLY}

Context:
${context}

Question:
${question}
`

    const text = await groqComplete({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Follow the user's instruction exactly. Do not use outside knowledge."
        },
        { role: "user", content: prompt }
      ]
    })

    const shouldFallback =
      !text ||
      typeof text !== "string" ||
      /\b(i\s+don'?t\s+know|do\s+not\s+know|not\s+in\s+the\s+context|no\s+relevant|cannot\s+find|can't\s+find|unable\s+to\s+find)\b/i.test(text)

    const finalAnswer = shouldFallback ? FALLBACK_REPLY : text

    console.log("🟣 Final Answer:", finalAnswer)

    res.json({
      answer: finalAnswer
    })

  } catch (error) {
    console.error("🔥 ERROR:", error)

    const rawMessage = error?.message || "Something went wrong"
    const status = Number(error?.status) || 500
    const isRateLimit = status === 429

    if (isRateLimit) {
      return res.status(429).json({
        error: "Groq API rate limit exceeded. Please retry in a moment.",
        details: rawMessage
      })
    }

    res.status(500).json({
      error: rawMessage
    })
  }
})

// --- CONTACT FORM HANDLER ---
app.post("/inquiry", async (req, res) => {
  try {
    const { name, email, projectType, budgetRange, timeline, preferredContact } = req.body
    const project = req.body?.project ?? req.body?.message
    const hp_website = (req.body?.hp_website || req.body?.website || "").toString().trim() // honeypot

    if (hp_website) {
      console.warn("🛡️ Honeypot triggered (Bot detected).")
      return res.json({ ok: true }) // silently accept bots
    }

    if (!name || !email || !project) {
      return res.status(400).json({ error: "Name, email, and project brief are required." })
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(String(email).trim())) {
      return res.status(400).json({ error: "Please enter a valid email address." })
    }

    console.log("📨 NEW CONTACT INQUIRY:", { name, email, projectType, budgetRange, timeline, preferredContact })

    const resendKey = (process.env.RESEND_API_KEY || "").trim()
    const to = (process.env.INQUIRY_TO_EMAIL || "").trim()
    const from = (process.env.INQUIRY_FROM_EMAIL || "onboarding@resend.dev").trim()

    if (!resendKey || !to) {
      return res.status(501).json({
        ok: false,
        error: "Email delivery is not configured.",
        missing: {
          RESEND_API_KEY: !resendKey,
          INQUIRY_TO_EMAIL: !to
        }
      })
    }

    const subject = `New inquiry from ${name}`
    
    const metaLines = [
      `<b>Project Type:</b> ${escapeHtml(projectType || 'Not specified')}`,
      `<b>Budget Range:</b> ${escapeHtml(budgetRange || 'Not specified')}`,
      `<b>Timeline:</b> ${escapeHtml(timeline || 'Not specified')}`,
      `<b>Preferred Contact:</b> ${escapeHtml(preferredContact || 'Not specified')}`
    ].join('<br>')

    const metaText = [
      `Project Type: ${projectType || 'Not specified'}`,
      `Budget Range: ${budgetRange || 'Not specified'}`,
      `Timeline: ${timeline || 'Not specified'}`,
      `Preferred Contact: ${preferredContact || 'Not specified'}`
    ].join('\n')

    const text = `CASA DESIGN Inquiry\n\nName: ${name}\nEmail: ${email}\n\n${metaText}\n\nMessage:\n${project}`

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:auto;border:1px solid #eee;padding:20px;border-radius:12px">
        <h2 style="margin:0 0 20px;color:#A68A64;font-style:italic">New Casa Design Inquiry</h2>
        <div style="background:#f9f9f9;padding:15px;border-radius:8px;margin-bottom:20px">
          <p style="margin:0 0 10px"><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p style="margin:0"><strong>Email:</strong> ${escapeHtml(email)}</p>
        </div>
        
        <div style="margin-bottom:20px">
          <h4 style="margin:0 0 10px;text-transform:uppercase;font-size:11px;letter-spacing:1px;color:#888">Project Details</h4>
          <p style="margin:0;font-size:14px;line-height:1.8">${metaLines}</p>
        </div>

        <div style="margin-bottom:20px">
          <h4 style="margin:0 0 10px;text-transform:uppercase;font-size:11px;letter-spacing:1px;color:#888">Project Brief</h4>
          <div style="background:#0b0b0b;color:#f5f5f7;padding:20px;border-radius:10px;white-space:pre-wrap;font-size:15px">${escapeHtml(project)}</div>
        </div>
        
        <p style="font-size:10px;color:#aaa;margin-top:30px;border-top:1px solid #eee;padding-top:10px">
          This inquiry was sent from the Casa Design contact form.
        </p>
      </div>
    `

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        text,
        reply_to: email
      })
    })

    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return res.status(502).json({
        ok: false,
        error: data?.message || "Failed to send email."
      })
    }

    res.json({ ok: true, id: data?.id || null })
  } catch (error) {
    console.error("🔥 CONTACT ERROR:", error)
    res.status(500).json({ error: "Failed to process inquiry." })
  }
})

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

const PORT = Number(process.env.PORT) || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
