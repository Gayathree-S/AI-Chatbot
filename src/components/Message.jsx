import { useState, useRef } from "react";
import { Copy, Check, Volume2, Square, Edit2, X, Check as CheckIcon } from "lucide-react";

const Message = ({ message, onEdit }) => {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.content);
  const utteranceRef = useRef(null);
  const textareaRef = useRef(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSpeak = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedText(message.content);
    // Focus textarea after state update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 0);
  };

  const handleSaveEdit = () => {
    if (editedText.trim() && editedText !== message.content) {
      onEdit(message.id, editedText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedText(message.content);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div
      id={message.id}
      className={`message ${message.role}-message ${
        message.loading ? "loading" : ""
      } ${message.error ? "error" : ""} ${isEditing ? "editing" : ""}`}
    >
      {/* 🐱 Bot avatar */}
      {message.role === "bot" && (
        <img
          src="/cat.webp"
          alt="Bot Avatar"
          className="avatar bounce-in"
        />
      )}

      {/* Bot message actions */}
      {message.role === "bot" && !message.loading && (
        <div className="actions">
          <button onClick={handleCopy} title="Copy">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>

          <button onClick={handleSpeak} title={speaking ? "Stop" : "Speak"}>
            {speaking ? <Square size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      )}

      {/* User message actions */}
      {message.role === "user" && !isEditing && (
        <div className="actions">
          <button onClick={handleEditClick} title="Edit message">
            <Edit2 size={16} />
          </button>
        </div>
      )}

      {/* Message text or edit mode */}
      {isEditing ? (
        <div className="edit-container">
          <textarea
            ref={textareaRef}
            className="edit-textarea"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
          />
          <div className="edit-actions">
            <button 
              className="edit-save-btn" 
              onClick={handleSaveEdit}
              disabled={!editedText.trim()}
              title="Save (Enter)"
            >
              <CheckIcon size={16} />
              Save
            </button>
            <button 
              className="edit-cancel-btn" 
              onClick={handleCancelEdit}
              title="Cancel (Esc)"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text">{message.content}</p>
      )}
    </div>
  );
};

export default Message;