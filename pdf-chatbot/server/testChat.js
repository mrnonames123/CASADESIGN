import readline from "readline"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function ask() {
  rl.question("You: ", async (question) => {

    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    })

    const data = await res.json()

    console.log("Bot:", data.answer)   // ✅ FIXED

    ask()
  })
}

ask()