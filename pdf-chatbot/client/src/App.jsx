import { useState } from "react"
import ChatBox from "./components/ChatBox"
import ChatInput from "./components/ChatInput"
import "./App.css"

function App() {
  const [messages, setMessages] = useState([])

  const sendMessage = async (text) => {
    const newMessages = [...messages, { sender: "user", text }]
    setMessages(newMessages)

    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question: text })
    })

    const data = await res.json()

    setMessages([
      ...newMessages,
      { sender: "bot", text: data.answer || data.error }
    ])
  }

  return (
    <div className="app">
      <h1>📄 PDF Chatbot</h1>
      <ChatBox messages={messages} />
      <ChatInput sendMessage={sendMessage} />
    </div>
  )
}

export default App