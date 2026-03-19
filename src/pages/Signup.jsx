import { useState } from "react";
import { supabase } from "../supabase";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&display=swap');

  .auth-wrapper {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    background: #0a0a0f;
    background-image:
      radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,75,145,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 80% 90%, rgba(56,40,100,0.12) 0%, transparent 50%);
    font-family: 'DM Sans', sans-serif;
    padding: 24px;
  }

  .auth-card {
    width: 100%; max-width: 420px;
    background: rgba(255,255,255,0.032);
    border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
    padding: 48px 44px 40px; backdrop-filter: blur(24px);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.04) inset, 0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(99,75,145,0.06);
    animation: cardIn 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes cardIn {
    from { opacity:0; transform:translateY(24px) scale(0.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  .auth-logo {
    display: flex; align-items: center; gap: 10px; margin-bottom: 36px;
  }

  .auth-logo-mark {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, #9d7fe8, #6b4fc8);
    border-radius: 9px; display: flex; align-items: center; justify-content: center;
    font-size: 15px; box-shadow: 0 4px 14px rgba(107,79,200,0.4);
  }

  .auth-logo-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px; font-weight: 500; color: rgba(255,255,255,0.85); letter-spacing: 0.02em;
  }

  .auth-heading {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px; font-weight: 300; color: #ffffff;
    letter-spacing: -0.01em; line-height: 1.15; margin: 0 0 6px;
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
    outline: none; transition: all 0.2s ease; box-sizing: border-box; -webkit-appearance: none;
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

  .password-hint {
    font-size: 11.5px; color: rgba(255,255,255,0.25);
    margin: 6px 0 0; font-weight: 300; letter-spacing: 0.01em;
  }

  .status-message {
    border-radius: 8px; padding: 10px 14px;
    font-size: 13px; margin-bottom: 16px; font-weight: 300;
  }

  .status-message.error {
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #f87171;
    animation: shake 0.35s cubic-bezier(.36,.07,.19,.97) both;
  }

  .status-message.success {
    background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2); color: #6ee7b7;
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
    letter-spacing: 0.02em; cursor: pointer; transition: all 0.2s ease;
    position: relative; overflow: hidden;
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

  .terms-text {
    font-size: 11.5px; color: rgba(255,255,255,0.22);
    text-align: center; margin-top: 14px; font-weight: 300; line-height: 1.6;
  }

  .terms-link {
    color: rgba(157,127,232,0.6); text-decoration: underline;
    text-underline-offset: 2px; cursor: pointer;
    background: none; border: none; padding: 0;
    font-family: inherit; font-size: inherit;
    transition: color 0.2s;
  }
  .terms-link:hover { color: rgba(157,127,232,0.9); }

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

  .strength-bar-wrap {
    display: flex; gap: 4px; margin-top: 8px;
  }

  .strength-bar-seg {
    flex: 1; height: 3px; border-radius: 99px;
    background: rgba(255,255,255,0.08);
    transition: background 0.3s ease;
  }

  .strength-label {
    font-size: 11px; color: rgba(255,255,255,0.25);
    margin-top: 4px; font-weight: 300; letter-spacing: 0.02em;
    min-height: 16px; transition: color 0.3s;
  }
`;

function getStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const strengthColors = ["", "#f87171", "#fbbf24", "#34d399", "#818cf8"];
const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

function Signup({ switchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const strength = getStrength(password);

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!email || !password) { setIsError(true); setMessage("Please fill in all fields."); return; }
    if (password.length < 6) { setIsError(true); setMessage("Password must be at least 6 characters."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) { setIsError(true); setMessage(error.message); }
    else { setIsError(false); setMessage("Check your email to confirm your account!"); }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-mark">✦</div>
            <span className="auth-logo-name">chatbot</span>
          </div>

          <h1 className="auth-heading">Create account</h1>
          <p className="auth-subheading">Start your journey today </p>

          <form onSubmit={handleSignup} style={{ margin: 0 }}>
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

            <div className="input-group" style={{ marginBottom: 20 }}>
              <label className="input-label">Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {password.length > 0 && (
                <>
                  <div className="strength-bar-wrap">
                    {[1,2,3,4].map(i => (
                      <div
                        key={i}
                        className="strength-bar-seg"
                        style={{ background: i <= strength ? strengthColors[strength] : undefined }}
                      />
                    ))}
                  </div>
                  <p className="strength-label" style={{ color: strength > 0 ? strengthColors[strength] : undefined }}>
                    {strength > 0 ? strengthLabels[strength] : ""}
                  </p>
                </>
              )}
              {!password && <p className="password-hint">Minimum 6 characters</p>}
            </div>

            {message && (
              <p className={`status-message ${isError ? "error" : "success"}`}>{message}</p>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="terms-text">
            By signing up, you agree to our{" "}
            <button className="terms-link">Terms of Service</button>
            {" "}and{" "}
            <button className="terms-link">Privacy Policy</button>.
          </p>

          <p className="auth-footer">
            Already have an account?{" "}
            <button className="auth-footer-link" onClick={switchToLogin}>Sign in</button>
          </p>
        </div>
      </div>
    </>
  );
}

export default Signup;