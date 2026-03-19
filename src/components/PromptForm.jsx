import { ArrowUp, Mic, MicOff } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { addMessage, updateConversationTitle } from "../supabaseService";

const PromptForm = ({
  conversations,
  setConversations,
  activeConversation,
  generateResponse,
  isLoading,
  setIsLoading,
  userId, // ✅ required: passed from ChatApp
}) => {
  const [promptText, setPromptText] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // ── Speech Recognition setup (unchanged) ──────────────────────────
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPromptText((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, []);

  const handleMic = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || !promptText.trim()) return;

    setIsLoading(true);
    const text = promptText.trim();
    setPromptText("");

    const currentConvo =
      conversations.find((c) => c.id === activeConversation) ||
      conversations[0];

    // ── 1. Auto-title the conversation on first message ──────────────
    let newTitle = currentConvo.title;
    if (currentConvo.messages.length === 0) {
      newTitle = text.length > 25 ? text.substring(0, 25) + "..." : text;

      try {
        // ✅ Persist title to Supabase
        await updateConversationTitle(currentConvo.id, newTitle);
      } catch (err) {
        console.error("Failed to update conversation title:", err);
      }
    }

    // ── 2. Save user message to Supabase ─────────────────────────────
    let savedUserMsg;
    try {
      savedUserMsg = await addMessage(activeConversation, {
        role: "user",
        content: text,
        loading: false,
        error: false,
      });
    } catch (err) {
      console.error("Failed to save user message:", err);
      setIsLoading(false);
      return; // don't proceed if save failed
    }

    const userMessage = {
      id: savedUserMsg.id, // ✅ use Supabase UUID (not a local temp id)
      role: "user",
      content: text,
      loading: false,
      error: false,
    };

    // Build the conversation snapshot for the API call (no bot placeholder yet)
    const apiConversation = {
      ...currentConvo,
      title: newTitle,
      messages: [...currentConvo.messages, userMessage],
    };

    // Update local UI with user message + new title
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversation
          ? { ...conv, title: newTitle, messages: [...conv.messages, userMessage] }
          : conv
      )
    );

    // ── 3. Short UX delay, then add bot placeholder ──────────────────
    setTimeout(async () => {
      // ✅ Save bot placeholder to Supabase immediately
      let savedBotMsg;
      try {
        savedBotMsg = await addMessage(activeConversation, {
          role: "bot",
          content: "Just a sec...",
          loading: true,
          error: false,
        });
      } catch (err) {
        console.error("Failed to save bot placeholder:", err);
        setIsLoading(false);
        return;
      }

      // Use a local temp id for DOM targeting (typing effect uses querySelector)
      const botLocalId = `bot-${Date.now()}`;

      const botMessage = {
        id: botLocalId,
        dbId: savedBotMsg.id, // ✅ keep the Supabase id for the final updateMessage call
        role: "bot",
        content: "Just a sec...",
        loading: true,
        error: false,
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversation
            ? { ...conv, messages: [...conv.messages, botMessage] }
            : conv
        )
      );

      // Pass both ids to generateResponse so it can:
      //  - target the DOM element via botLocalId
      //  - update the Supabase row via savedBotMsg.id
      generateResponse(apiConversation, botLocalId, savedBotMsg.id);
    }, 300);
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <form className="prompt-form" onSubmit={handleSubmit}>
      <div className="prompt-row">
        <input
          placeholder="Message Gemini..."
          className="prompt-input"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          required
        />

        <button
          type="button"
          className={`mic-btn ${listening ? "listening" : ""}`}
          onClick={handleMic}
          title={listening ? "Stop listening" : "Start voice input"}
        >
          {listening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <button
          type="submit"
          className="send-prompt-btn"
          disabled={isLoading || !promptText.trim()}
          title="Send message"
        >
          <ArrowUp size={20} />
        </button>
      </div>
    </form>
  );
};

export default PromptForm;