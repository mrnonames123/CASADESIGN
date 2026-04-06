import fs from "fs"
import path from "path"
import { createRequire } from "module"
import { fileURLToPath } from "url"

const require = createRequire(import.meta.url)
const pdfParseModule = require("pdf-parse")

const pdfParse = pdfParseModule.default || pdfParseModule
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pdfDir = path.resolve(__dirname, "../pdf")

function listPdfFiles() {
  if (!fs.existsSync(pdfDir)) {
    throw new Error(`PDF directory not found: ${pdfDir}`)
  }

  const files = fs
    .readdirSync(pdfDir)
    .filter((name) => name.toLowerCase().endsWith(".pdf"))
    .sort((a, b) => a.localeCompare(b))

  if (!files.length) {
    throw new Error(`No PDF files found in: ${pdfDir}`)
  }

  return files.map((name) => path.join(pdfDir, name))
}

export async function loadPDF() {
  const pdfFiles = listPdfFiles()

  const texts = []
  for (const fullPath of pdfFiles) {
    const buffer = fs.readFileSync(fullPath)
    const data = await pdfParse(buffer)
    const filename = path.basename(fullPath)
    texts.push(`\n\n--- SOURCE: ${filename} ---\n\n${data.text || ""}`)
  }

  return texts.join("\n")
}
