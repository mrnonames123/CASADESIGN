const STOP_WORDS = new Set([
    "a", "an", "the", "is", "are", "was", "were", "to", "of", "in", "on", "for", "and", "or", "but",
    "with", "from", "at", "by", "about", "what", "who", "when", "where", "why", "how", "which", "tell",
    "me", "this", "that", "it", "as", "be", "do", "does", "did", "company"
])

function normalize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
}

function stem(token) {
    // Lightweight stemming to improve matching for simple word forms.
    if (token.length <= 4) return token
    return token
        .replace(/(ing|edly|edly|ed|ly|es|s)$/g, "")
}

function tokenize(text) {
    if (!text) return []

    return normalize(text)
        .split(" ")
        .map(stem)
        .filter((token) => token.length >= 3 && !STOP_WORDS.has(token))
}

function scoreChunk(questionTokens, chunkText) {
    if (!chunkText) return 0

    const normalizedChunk = normalize(chunkText)
    const chunkTokens = new Set(tokenize(chunkText))

    let score = 0

    for (const token of questionTokens) {
        if (chunkTokens.has(token)) {
            score += 4
            continue
        }

        if (normalizedChunk.includes(token)) {
            score += 2
        }
    }

    return score
}

export function findRelevantChunks(question, chunks) {
    if (!Array.isArray(chunks) || typeof question !== "string") {
        return []
    }

    const questionTokens = tokenize(question)

    if (!questionTokens.length) {
        return []
    }

    const scored = chunks
        .map((chunk, index) => ({
            chunk,
            index,
            score: typeof chunk === "string" ? scoreChunk(questionTokens, chunk) : 0
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score
            return a.index - b.index
        })

    return scored.slice(0, 3).map((item) => item.chunk)
}