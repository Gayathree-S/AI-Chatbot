import { useEffect, useState } from "react";
import { supabase } from "./supabase";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatApp from "./ChatApp"; // your existing chat app

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    // 1️⃣ Check existing session on page load
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setChecking(false);
    };

    checkSession();

    // 2️⃣ Listen for auth changes (login / logout / token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // 3️⃣ Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 🔄 Loading while checking auth
  if (checking) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // 🔐 NOT LOGGED IN → SHOW AUTH PAGES
  if (!user) {
    return showSignup ? (
      <Signup switchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login switchToSignup={() => setShowSignup(true)} />
    );
  }

  // ✅ LOGGED IN → SHOW CHAT APP
  return <ChatApp user={user} />;
}

export default App;
