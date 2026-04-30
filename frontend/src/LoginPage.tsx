import { useState, FormEvent, CSSProperties } from "react";
import API from "./API.tsx";

interface LoginPageProps {
  onLogin: (email: string) => void;
  onRegister: () => void;
}

export default function LoginPage({ onLogin, onRegister }: LoginPageProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("auth/jwt/create/", { email, password });
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      onLogin(email);
    } catch (err: any) {
      const message = err.response?.data?.detail;
      setError(message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.grid} aria-hidden="true" />

      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoMark}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="1" y="1" width="9" height="9" rx="2" fill="#e8d5c4" />
              <rect x="12" y="1" width="9" height="9" rx="2" fill="#c9b8a8" opacity="0.6" />
              <rect x="1" y="12" width="9" height="9" rx="2" fill="#c9b8a8" opacity="0.6" />
              <rect x="12" y="12" width="9" height="9" rx="2" fill="#e8d5c4" />
            </svg>
          </div>
          <span style={styles.logoText}>TaskFlow</span>
        </div>

        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.subheading}>Sign in to manage your projects and tasks.</p>

        {error && (
          <div style={styles.errorBox}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="7" cy="7" r="6.5" stroke="#b94040" />
              <path d="M7 4v3.5M7 9.5v.5" stroke="#b94040" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">Password</label>
            <div style={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...styles.input, paddingRight: "2.75rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.8 5.3 1.8 6.5 1.5 8c.8 3.2 3.5 5.5 6.5 5.5 1.3 0 2.5-.4 3.5-1.1M6.5 2.6C7 2.5 7.5 2.5 8 2.5c3 0 5.7 2.3 6.5 5.5-.3 1.1-.8 2.1-1.6 2.9" stroke="#8a7a6a" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1.5 8C2.3 4.8 5 2.5 8 2.5S13.7 4.8 14.5 8C13.7 11.2 11 13.5 8 13.5S2.3 11.2 1.5 8Z" stroke="#8a7a6a" strokeWidth="1.2" />
                    <circle cx="8" cy="8" r="2" stroke="#8a7a6a" strokeWidth="1.2" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? <span style={styles.spinner} /> : "Sign in"}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <span onClick={onRegister} style={styles.link}>
            Create one
          </span>
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital@0;1&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #bbb0a4; }
        input:focus { outline: none; border-color: #c4a882 !important; box-shadow: 0 0 0 3px rgba(196,168,130,0.18); }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#f5f0eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(180,160,140,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(180,160,140,0.13) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },
  card: {
    background: "#fffefb",
    border: "1px solid #e2d8ce",
    borderRadius: "18px",
    padding: "2.5rem 2.25rem",
    width: "100%",
    maxWidth: "400px",
    position: "relative",
    animation: "fadeUp 0.45s ease both",
    boxShadow: "0 2px 32px rgba(120,90,60,0.08)",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "1.75rem",
  },
  logoMark: {
    width: "34px",
    height: "34px",
    background: "#3d2e20",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: "'Lora', serif",
    fontSize: "18px",
    fontWeight: "400",
    color: "#3d2e20",
    letterSpacing: "-0.3px",
  },
  heading: {
    fontFamily: "'Lora', serif",
    fontSize: "26px",
    fontWeight: "400",
    color: "#2a1f14",
    letterSpacing: "-0.5px",
    marginBottom: "6px",
  },
  subheading: {
    fontSize: "14px",
    color: "#9c8c7c",
    marginBottom: "1.75rem",
    lineHeight: "1.5",
  },
  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    background: "#fef3f3",
    border: "1px solid #f5c4c4",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "13px",
    color: "#8a3030",
    marginBottom: "1.25rem",
    lineHeight: "1.5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#6b5a4a",
    letterSpacing: "0.01em",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "14px",
    color: "#2a1f14",
    background: "#faf8f5",
    border: "1px solid #ddd4c8",
    borderRadius: "9px",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "'DM Sans', sans-serif",
  },
  passwordWrapper: {
    position: "relative",
  },
  eyeBtn: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "4px",
  },
  submitBtn: {
    marginTop: "0.5rem",
    width: "100%",
    padding: "11px",
    background: "#3d2e20",
    color: "#f5ede2",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "500",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s, transform 0.1s",
    letterSpacing: "0.02em",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(245,237,226,0.3)",
    borderTop: "2px solid #f5ede2",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  footer: {
    textAlign: "center",
    fontSize: "13px",
    color: "#9c8c7c",
    marginTop: "1.5rem",
  },
  link: {
    color: "#7a5c3a",
    textDecoration: "none",
    fontWeight: "500",
  },
};