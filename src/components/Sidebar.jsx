import { Menu, Moon, Plus, Sparkles, Sun, Trash2 } from "lucide-react";
import { supabase } from "../supabase";

const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  conversations,
  setConversations,
  activeConversation,
  setActiveConversation,
  theme,
  setTheme,
  user, // ✅ receive user prop
}) => {

  // 🔐 Logout + cleanup
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setConversations([]);
    setActiveConversation(null);
  };

  // ➕ Create new conversation
  const createNewConversation = () => {
    const emptyConversation = conversations.find(
      (conv) => conv.messages.length === 0
    );
    if (emptyConversation) {
      setActiveConversation(emptyConversation.id);
      return;
    }
    const newConversation = {
      id: `conv-${Date.now()}`,
      title: "New Chat",
      messages: [],
    };
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversation(newConversation.id);
  };

  // 🗑 Delete conversation
  const deleteConversation = (id, e) => {
    e.stopPropagation();
    const updated = conversations.filter((conv) => conv.id !== id);
    if (updated.length === 0) {
      const fallback = { id: "default", title: "New Chat", messages: [] };
      setConversations([fallback]);
      setActiveConversation(fallback.id);
      return;
    }
    setConversations(updated);
    if (activeConversation === id) {
      setActiveConversation(updated[0].id);
    }
  };

  // 👤 Get avatar letter and display name from user
  const avatarLetter = user?.email?.charAt(0).toUpperCase() ?? "?";
  const displayEmail = user?.email ?? "";
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    displayEmail.split("@")[0];

  return (
    <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>

      {/* Header */}
      <div className="sidebar-header">
        <button
          className="sidebar-toggle"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
        >
          <Menu size={18} />
        </button>

        <button className="new-chat-btn" onClick={createNewConversation}>
          <Plus size={20} />
          <span>New chat</span>
        </button>
      </div>

      {/* Chat list */}
      <div className="sidebar-content">
        <h2 className="sidebar-title">Chat history</h2>

        <ul className="conversation-list">
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className={`conversation-item ${
                activeConversation === conv.id ? "active" : ""
              }`}
              onClick={() => setActiveConversation(conv.id)}
            >
              <div className="conversation-icon-title">
                <div className="conversation-icon">
                  <Sparkles size={14} />
                </div>
                <span className="conversation-title">{conv.title}</span>
              </div>

              {conversations.length > 1 && (
                <button
                  className="delete-btn"
                  onClick={(e) => deleteConversation(conv.id, e)}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">

        {/* Theme toggle */}
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? (
            <>
              <Moon size={20} />
              <span>Dark mode</span>
            </>
          ) : (
            <>
              <Sun size={20} />
              <span>Light mode</span>
            </>
          )}
        </button>

        {/* User profile + logout */}
        <div className="user-profile">
          <div className="user-avatar">{avatarLetter}</div>

          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-email">{displayEmail}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;