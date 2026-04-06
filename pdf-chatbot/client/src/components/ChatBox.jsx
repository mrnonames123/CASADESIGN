import Message from "./Message"

function ChatBox({ messages }) {
  return (
    <div className="chatbox">
      {messages.map((msg, index) => (
        <Message key={index} sender={msg.sender} text={msg.text} />
      ))}
    </div>
  )
}

export default ChatBox