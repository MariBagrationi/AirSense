import { createSignal, For, Show, type Component } from "solid-js";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  onClose?: () => void;
}

const Chatbot: Component<ChatbotProps> = (props) => {
  const [messages, setMessages] = createSignal<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your air quality assistant. Ask me about air quality data, pollution levels, or anything related to environmental monitoring.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = createSignal("");
  const [isMinimized, setIsMinimized] = createSignal(false);
  let messagesContainer: HTMLDivElement | undefined;

  const sendMessage = () => {
    const text = inputText().trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");

    // Simulate bot response (you'll replace this with actual API call)
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message! I'm still learning. In the future, I'll be able to help you with detailed air quality information and analysis.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Scroll to bottom
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 1000);

    // Scroll to bottom
    setTimeout(() => {
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      class="chatbot-container"
      style={{
        position: "fixed",
        left: "20px",
        bottom: "20px",
        width: "300px",
        height: isMinimized() ? "60px" : "400px",
        background: "rgba(255, 255, 255, 0.95)",
        "border-radius": "12px",
        "box-shadow": "0 8px 32px rgba(0, 0, 0, 0.3)",
        "backdrop-filter": "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        "z-index": 10001,
        display: "flex",
        "flex-direction": "column",
        overflow: "hidden",
        transition: "height 0.3s ease"
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          "justify-content": "space-between",
          "align-items": "center",
          cursor: "pointer"
        }}
        onClick={() => setIsMinimized(!isMinimized())}
      >
        <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              background: "#4ade80",
              "border-radius": "50%"
            }}
          />
          <span style={{ "font-weight": "600", "font-size": "14px" }}>
            Air Quality Assistant
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              "font-size": "16px",
              padding: "0",
              width: "20px",
              height: "20px",
              display: "flex",
              "align-items": "center",
              "justify-content": "center"
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized());
            }}
          >
            {isMinimized() ? "⬆" : "⬇"}
          </button>
          <Show when={props.onClose}>
            <button
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                "font-size": "16px",
                padding: "0",
                width: "20px",
                height: "20px",
                display: "flex",
                "align-items": "center",
                "justify-content": "center"
              }}
              onClick={(e) => {
                e.stopPropagation();
                props.onClose?.();
              }}
            >
              ✕
            </button>
          </Show>
        </div>
      </div>

      <Show when={!isMinimized()}>
        {/* Messages */}
        <div
          ref={messagesContainer}
          style={{
            flex: "1",
            padding: "16px",
            "overflow-y": "auto",
            "scroll-behavior": "smooth"
          }}
        >
          <For each={messages()}>
            {(message) => (
              <div
                style={{
                  display: "flex",
                  "flex-direction": "column",
                  "margin-bottom": "12px",
                  "align-items": message.isUser ? "flex-end" : "flex-start"
                }}
              >
                <div
                  style={{
                    "max-width": "80%",
                    padding: "8px 12px",
                    "border-radius": message.isUser
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    background: message.isUser
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "#f1f5f9",
                    color: message.isUser ? "white" : "#334155",
                    "font-size": "14px",
                    "line-height": "1.4",
                    "word-wrap": "break-word"
                  }}
                >
                  {message.text}
                </div>
                <div
                  style={{
                    "font-size": "11px",
                    color: "#64748b",
                    "margin-top": "4px",
                    "margin-left": message.isUser ? "0" : "12px",
                    "margin-right": message.isUser ? "12px" : "0"
                  }}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Input */}
        <div
          style={{
            padding: "12px 16px",
            "border-top": "1px solid #e2e8f0",
            display: "flex",
            gap: "8px"
          }}
        >
          <input
            type="text"
            placeholder="Ask about air quality..."
            value={inputText()}
            onInput={(e) => setInputText(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
            style={{
              flex: "1",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              "border-radius": "20px",
              outline: "none",
              "font-size": "14px",
              background: "white"
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText().trim()}
            style={{
              padding: "8px 16px",
              background: inputText().trim()
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "#d1d5db",
              color: "white",
              border: "none",
              "border-radius": "20px",
              cursor: inputText().trim() ? "pointer" : "not-allowed",
              "font-size": "14px",
              "font-weight": "500",
              transition: "background 0.2s ease"
            }}
          >
            Send
          </button>
        </div>
      </Show>
    </div>
  );
};

export default Chatbot;