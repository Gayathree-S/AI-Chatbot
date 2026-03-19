 🐱 AI Chatbot

A full-stack, real-time AI chatbot web application built with **React**, **Vite**, and **Supabase**. Users can sign up, log in, and have persistent conversations with an AI — with each user's chat history securely stored and separated in the cloud.


> _Add a screenshot or screen recording of your app here_



## ✨ Features

- 🔐 **Authentication** — Email/password and Google OAuth login via Supabase Auth
- 💬 **Real-time AI Chat** — Conversational responses powered by the Gemini API with a typing animation effect
- 🗂️ **Persistent Chat History** — Conversations and messages stored per user in Supabase
- 🎙️ **Voice Input** — Send messages using your microphone via the Web Speech API
- ✏️ **Edit Messages** — Edit a previous message and regenerate the AI response from that point
- 🌗 **Light / Dark Theme** — Toggle between themes with preference saved locally
- 📱 **Responsive UI** — Works across desktop and mobile with a collapsible sidebar
- 🔒 **Row Level Security** — Each user can only access their own data

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Styling | CSS (custom) |
| Authentication | Supabase Auth |
| Database | Supabase (PostgreSQL) |
| AI API | Google Gemini API |
| Voice Input | Web Speech API (browser built-in) |


---

## 📁 Folder Structure

```
chatbot/
├── public/
│   └── cat.webp              # App logo shown on the welcome screen
│
├── src/
│   ├── assets/
│   │   └── cat.svg           # SVG version of the app logo
│   │
│   ├── components/
│   │   ├── Message.jsx       # Renders a single chat message (user or bot)
│   │   ├── PromptForm.jsx    # Input form with send button and mic toggle
│   │   └── Sidebar.jsx       # Conversation list, new chat button, theme toggle
│   │
│   ├── pages/
│   │   ├── Login.jsx         # Login page (email/password + Google OAuth)
│   │   └── Signup.jsx        # Signup page with password strength indicator
│   │
│   ├── App.jsx               # Root component — handles auth state and routing
│   ├── App.css               # Global component styles
│   ├── ChatApp.jsx           # Main chat UI — manages conversations and AI calls
│   ├── index.css             # Base styles and CSS variables (themes)
│   ├── main.jsx              # React entry point
│   ├── supabase.js           # Supabase client initialisation
│   └── supabaseService.js    # All database functions (conversations & messages)
│
├── .env                      # Environment variables (never commit this)
├── .gitignore                # Files excluded from Git
├── eslint.config.js          # ESLint configuration
├── index.html                # HTML entry point
├── package.json              # Project dependencies and scripts
├── vite.config.js            # Vite build configuration
└── README.md                 # Project documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [Supabase](https://supabase.com/) account and project
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-chatbot.git
cd ai-chatbot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root of the project:

```bash
cp .env.example .env
```

Then fill in your values (see [Environment Variables](#-environment-variables) below).

### 4. Set up Supabase

Run the following SQL in your Supabase **SQL Editor** to create the required tables:

```sql
-- Conversations table
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'bot')),
  content TEXT,
  loading BOOLEAN DEFAULT false,
  error BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own conversations"
ON conversations FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can access own messages"
ON messages FOR ALL
USING (
  conversation_id IN (
    SELECT id FROM conversations WHERE user_id = auth.uid()
  )
);
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Environment Variables

Create a `.env` file in the project root with the following keys:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |
| `VITE_GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

---

## 🔄 How the Project Works

```
User visits app
      │
      ▼
App.jsx checks Supabase auth session
      │
      ├── Not logged in ──▶ Login.jsx / Signup.jsx
      │
      └── Logged in ──▶ ChatApp.jsx
                              │
                              ├── Loads user's conversations from Supabase
                              ├── Renders Sidebar (conversation list)
                              └── Renders active conversation messages
                                          │
                              User types a message
                                          │
                              PromptForm.jsx
                                          │
                              ├── Saves user message to Supabase
                              ├── Saves bot placeholder to Supabase
                              └── Calls Gemini API
                                          │
                              Response streams in with typing effect
                                          │
                              Final bot message updated in Supabase
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

[GitHub](https://github.com/GayathreeS) · [LinkedIn](www.linkedin.com/in/gayathree-s)