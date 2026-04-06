function Message({ sender, text }) {
  return (
    <div className={sender === "user" ? "user-msg" : "bot-msg"}>
      <b>{sender === "user" ? "You" : "Bot"}:</b> {text}
    </div>
  )
}

export default Message