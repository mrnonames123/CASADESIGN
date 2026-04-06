import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { GoogleGenerativeAI } from "@google/generative-ai"
import path from "path"
import { fileURLToPath } from "url"

import { loadPDF } from "./services/pdfLoader.js"
import { chunkText } from "./services/chunkText.js"
import { findRelevantChunks } from "./services/textSearch.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure we always load `pdf-chatbot/server/.env` even when started from repo root.
dotenv.config({ path: path.join(__dirname, ".env") })

// ✅ FIX 1: Create app
const app = express()

app.use(cors())
app.use(express.json())

// ✅ Gemini setup
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.0-flash"

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
const model = genAI
  ? genAI.getGenerativeModel({ model: MODEL_NAME })
  : null

if (!apiKey) {
  console.warn("⚠️ Missing GEMINI_API_KEY. Add `GEMINI_API_KEY=...` to pdf-chatbot/server/.env and restart.")
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

console.log("🤖 Gemini model:", MODEL_NAME)

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    model: MODEL_NAME,
    pdfReady: isPdfReady,
    pdfFiles: pdfFilesLoaded,
    pdfError: pdfLoadError || null,
    hasApiKey: Boolean(apiKey)
  })
})

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

    if (!model) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY. Add it to pdf-chatbot/server/.env and restart the server."
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

    const result = await model.generateContent(prompt)

    console.log("🔵 Gemini Raw Result:", result)

    const response = await result.response
    const text = response.text()

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
    const isQuotaError =
      rawMessage.includes("[429 Too Many Requests]") ||
      rawMessage.toLowerCase().includes("quota exceeded")
    const isModelError =
      rawMessage.includes("[404 Not Found]") && rawMessage.includes("models/")

    if (isQuotaError) {
      return res.status(429).json({
        error: "Gemini API quota exceeded. Check billing/rate limits and retry later.",
        details: rawMessage
      })
    }

    if (isModelError) {
      return res.status(500).json({
        error: `Configured Gemini model '${MODEL_NAME}' is unavailable. Update GEMINI_MODEL in server/.env.`,
        details: rawMessage
      })
    }

    res.status(500).json({
      error: rawMessage
    })
  }
})

const PORT = Number(process.env.PORT) || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
