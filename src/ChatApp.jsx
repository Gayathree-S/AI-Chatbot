import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "./supabase";
import {
  createConversation,
  getUserConversations,
  addMessage,
  updateMessage,
  deleteConversation,
  updateConversationTitle
} from "./supabaseService";
import Message from "./components/Message";
import PromptForm from "./components/PromptForm";
import Sidebar from "./components/Sidebar";
import { Menu } from "lucide-react";

const ChatApp = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const typingInterval = useRef(null);
  const messagesContainerRef = useRef(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // ✅ Load this user's conversations from Supabase on mount
  useEffect(() => {
    if (!user?.id) return;

    const loadConversations = async () => {
      try {
        const data = await getUserConversations(user.id);

        if (data.length === 0) {
          // New user — create their first conversation
          const newConv = await createConversation(user.id, "New Chat");
          setConversations([newConv]);
          setActiveConversation(newConv.id);
        } else {
          setConversations(data);
          setActiveConversation(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoadingChats(false);
      }
    };

    loadConversations();
  }, [user.id]);

  // Theme (localStorage is fine for preferences, not data)
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const currentConversation = conversations.find((c) => c.id === activeConversation) || conversations[0];

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeConversation]);

  // ✅ Typing effect — updates local state only (no DB write per word)
  const typingEffect = (text, messageId, dbMessageId) => {
    const words = text.split(" ");
    let wordIndex = 0;
    let currentText = "";

    clearInterval(typingInterval.current);

    typingInterval.current = setInterval(async () => {
      if (wordIndex < words.length) {
        currentText += (wordIndex === 0 ? "" : " ") + words[wordIndex++];

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversation
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId
                      ? { ...msg, content: currentText, loading: true }
                      : msg
                  ),
                }
              : conv
          )
        );
        scrollToBottom();
      } else {
        clearInterval(typingInterval.current);

        // ✅ Only write to Supabase once — after typing is complete
        if (dbMessageId) {
          await updateMessage(dbMessageId, {
            content: currentText,
            loading: false,
          });
        }

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversation
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId
                      ? { ...msg, content: currentText, loading: false }
                      : msg
                  ),
                }
              : conv
          )
        );
        setIsLoading(false);
      }
    }, 40);
  };

  // ✅ Generate response — saves user message + bot message to Supabase
  const generateResponse = async (conversation, botMessageId, dbBotMessageId) => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const formattedMessages = conversation.messages
      ?.filter((m) => !m.loading)
      .map((msg) => ({
        role: msg.role === "bot" ? "model" : msg.role,
        parts: [{ text: msg.content }],
      }));

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: formattedMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error.message);

      const responseText = data.candidates[0].content.parts[0].text
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .trim();

      typingEffect(responseText, botMessageId, dbBotMessageId);
    } catch (error) {
      setIsLoading(false);
      if (dbBotMessageId) {
        await updateMessage(dbBotMessageId, { content: error.message, loading: false, error: true });
      }
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversation
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === botMessageId
                    ? { ...msg, content: error.message, loading: false, error: true }
                    : msg
                ),
              }
            : conv
        )
      );
    }
  };

  // ✅ Handle message edit
  const handleEditMessage = async (messageId, newContent) => {
    const currentConvo = conversations.find((conv) => conv.id === activeConversation);
    if (!currentConvo) return;

    const messageIndex = currentConvo.messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) return;

    const messagesUpToEdit = currentConvo.messages.slice(0, messageIndex);
    const updatedMessage = { ...currentConvo.messages[messageIndex], content: newContent };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversation
          ? { ...conv, messages: [...messagesUpToEdit, updatedMessage] }
          : conv
      )
    );

    setIsLoading(true);

    const apiConversation = {
      ...currentConvo,
      messages: [...messagesUpToEdit, updatedMessage],
    };

    setTimeout(async () => {
      // Save a new bot message placeholder to Supabase
      const savedBot = await addMessage(activeConversation, {
        role: "bot",
        content: "Just a sec...",
        loading: true,
      });

      const botMessageId = `bot-${Date.now()}`;
      const botMessage = { id: botMessageId, role: "bot", content: "Just a sec...", loading: true };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversation
            ? { ...conv, messages: [...messagesUpToEdit, updatedMessage, botMessage] }
            : conv
        )
      );

      generateResponse(apiConversation, botMessageId, savedBot.id);
    }, 300);
  };

  // ✅ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loadingChats) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading your chats...</div>;
  }

  return (
    <div className={`app-container ${theme === "light" ? "light-theme" : "dark-theme"}`}>
      <div className={`overlay ${isSidebarOpen ? "show" : "hide"}`} onClick={() => setIsSidebarOpen(false)} />
      <Sidebar
        conversations={conversations}
        setConversations={setConversations}
        activeConversation={activeConversation}
        setActiveConversation={setActiveConversation}
        theme={theme}
        setTheme={setTheme}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        userId={user.id}           // ✅ pass userId to Sidebar for new chat creation
        onLogout={handleLogout}    // ✅ logout button in sidebar
      />
      <main className="main-container">
        <header className="main-header">
          <button onClick={() => setIsSidebarOpen(true)} className="sidebar-toggle">
            <Menu size={18} />
          </button>
        </header>

        {!currentConversation ? (
  <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
) : currentConversation.messages.length === 0 ? (
  <div className="welcome-container">
    <img className="welcome-logo" src="/cat.webp" alt="Logo" />
    <h1 className="welcome-heading">Hey kitty</h1>
    <p className="welcome-text">Ask me anything. I'm here to help!</p>
  </div>
) : (
  <div className="messages-container" ref={messagesContainerRef}>
    {currentConversation.messages.map((message) => (
      <Message key={message.id} message={message} onEdit={handleEditMessage} />
    ))}
  </div>
)}

        <div className="prompt-container">
          <div className="prompt-wrapper">
            <PromptForm
              conversations={conversations}
              setConversations={setConversations}
              activeConversation={activeConversation}
              generateResponse={generateResponse}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              userId={user.id}    // ✅ pass to PromptForm for saving messages
            />
          </div>
          <p className="disclaimer-text">Gemini can make mistakes, so double-check it.</p>
        </div>
      </main>
    </div>
  );
};

export default ChatApp;