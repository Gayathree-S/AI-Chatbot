import { useState } from "react";
import { supabase } from "../supabase";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&display=swap');

  .auth-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0f;
    background-image:
      radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,75,145,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 80% 90%, rgba(56,40,100,0.12) 0%, transparent 50%);
    font-family: 'DM Sans', sans-serif;
    padding: 24px;
  }

  .auth-card {
    width: 100%;
    max-width: 420px;
    background: rgba(255,255,255,0.032);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 48px 44px 40px;
    backdrop-filter: blur(24px);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.04) inset, 0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(99,75,145,0.06);
    animation: cardIn 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes cardIn {
    from { opacity:0; transform:translateY(24px) scale(0.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  .auth-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 36px;
  }

  .auth-logo-mark {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, #9d7fe8, #6b4fc8);
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px;
    box-shadow: 0 4px 14px rgba(107,79,200,0.4);
  }

  .auth-logo-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px; font-weight: 500;
    color: rgba(255,255,255,0.85);
    letter-spacing: 0.02em;
  }

  .auth-heading {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px; font-weight: 300;
    color: #ffffff; letter-spacing: -0.01em; line-height: 1.15;
    margin: 0 0 6px;
  }

  .auth-subheading {
    font-size: 13.5px; color: rgba(255,255,255,0.38);
    font-weight: 300; margin: 0 0 32px; letter-spacing: 0.01em;
  }

  .input-group { margin-bottom: 14px; }

  .input-label {
    display: block; font-size: 11px; font-weight: 500;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: rgba(255,255,255,0.35); margin-bottom: 7px;
  }

  .auth-input {
    width: 100%; background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09); border-radius: 10px;
    padding: 13px 16px; font-size: 14px; color: rgba(255,255,255,0.9);
    font-family: 'DM Sans', sans-serif; font-weight: 300;
    outline: none; transition: all 0.2s ease;
    box-sizing: border-box; -webkit-appearance: none;
  }

  .auth-input::placeholder { color: rgba(255,255,255,0.2); }

  .auth-input:focus {
    border-color: rgba(157,127,232,0.5);
    background: rgba(157,127,232,0.06);
    box-shadow: 0 0 0 3px rgba(157,127,232,0.08);
  }

  .auth-input:-webkit-autofill,
  .auth-input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px #111118 inset;
    -webkit-text-fill-color: rgba(255,255,255,0.9);
  }

  .forgot-link {
    display: block; text-align: right; font-size: 12px;
    color: rgba(157,127,232,0.7); cursor: pointer;
    background: none; border: none; padding: 0;
    font-family: 'DM Sans', sans-serif; font-weight: 300;
    transition: color 0.2s; margin-top: -6px; margin-bottom: 22px;
  }
  .forgot-link:hover { color: rgba(157,127,232,1); }

  .error-message {
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
    border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #f87171;
    margin-bottom: 16px; font-weight: 300;
    animation: shake 0.35s cubic-bezier(.36,.07,.19,.97) both;
  }

  @keyframes shake {
    10%,90% { transform:translateX(-2px); }
    20%,80% { transform:translateX(3px); }
    30%,50%,70% { transform:translateX(-3px); }
    40%,60% { transform:translateX(3px); }
  }

  .btn-primary {
    width: 100%;
    background: linear-gradient(135deg, #9d7fe8 0%, #6b4fc8 100%);
    color: white; border: none; border-radius: 10px; padding: 14px;
    font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.02em; cursor: pointer;
    transition: all 0.2s ease; position: relative; overflow: hidden;
    box-shadow: 0 4px 20px rgba(107,79,200,0.35);
  }

  .btn-primary::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
    opacity: 0; transition: opacity 0.2s;
  }
  .btn-primary:hover::after { opacity: 1; }
  .btn-primary:hover { box-shadow: 0 6px 28px rgba(107,79,200,0.5); transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  .divider {
    display: flex; align-items: center; gap: 12px; margin: 20px 0;
  }
  .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
  .divider-text {
    font-size: 11px; color: rgba(255,255,255,0.25);
    text-transform: uppercase; letter-spacing: 0.1em;
  }

  .btn-google {
    width: 100%; background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 13px;
    font-size: 14px; font-weight: 400; font-family: 'DM Sans', sans-serif;
    color: rgba(255,255,255,0.75); cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: all 0.2s ease; letter-spacing: 0.01em;
  }
  .btn-google:hover {
    background: rgba(255,255,255,0.09);
    border-color: rgba(255,255,255,0.18);
    color: rgba(255,255,255,0.95);
  }

  .auth-footer {
    text-align: center; margin-top: 28px; font-size: 13px;
    color: rgba(255,255,255,0.3); font-weight: 300;
  }

  .auth-footer-link {
    background: none; border: none; padding: 0;
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    color: rgba(157,127,232,0.85); cursor: pointer; font-weight: 400;
    transition: color 0.2s; text-decoration: underline;
    text-underline-offset: 2px; text-decoration-color: rgba(157,127,232,0.35);
  }
  .auth-footer-link:hover { color: #9d7fe8; text-decoration-color: rgba(157,127,232,0.7); }

  .spinner {
    display: inline-block; width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
    border-radius: 50%; animation: spin 0.7s linear infinite;
    vertical-align: middle; margin-right: 8px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

function Login({ switchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email || !password) { setErrorMsg("Please fill in all fields."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setErrorMsg(error.message);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-mark">✦</div>
            <span className="auth-logo-name">chatbot  </span>
          </div>

          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-subheading">Sign in to continue to your account</p>

          <form onSubmit={handleLogin} style={{ margin: 0 }}>
            <div className="input-group">
              <label className="input-label">Email address</label>
              <input
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ marginBottom: 8 }}>
              <label className="input-label">Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="button" className="forgot-link">Forgot password?</button>

            {errorMsg && <p className="error-message">{errorMsg}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">or</span>
            <div className="divider-line" />
          </div>

          <button onClick={handleGoogle} className="btn-google">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="auth-footer">
            Don't have an account?{" "}
            <button className="auth-footer-link" onClick={switchToSignup}>Create one</button>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;