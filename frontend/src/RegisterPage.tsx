import { useState, FormEvent, CSSProperties } from "react";
import API from "./API.tsx";

interface RegisterPageProps {
  onBackToLogin: () => void;
}

export default function RegisterPage({ onBackToLogin }: RegisterPageProps) {
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    re_password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.re_password) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await API.post("auth/users/", {
        email: form.email,
        name: form.name,
        password: form.password,
        re_password: form.re_password,
      });
      setSuccess(true);
    } catch (err: any) {
      const data = err.response?.data;
      const msg = data?.email?.[0] || data?.password?.[0] || data?.detail || "Registration failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.root}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h1 style={styles.heading}>Check your email</h1>
          <p style={styles.subheading}>
            We sent a verification link to <strong>{form.email}</strong>.
            Click the link to activate your account.
          </p>
          <button onClick={onBackToLogin} style={styles.submitBtn}>
            Back to Login
          </button>
        </div>
        <style>{globalStyles}</style>
      </div>
    );
  }

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

        <h1 style={styles.heading}>Create an account</h1>
        <p style={styles.subheading}>Sign up to start managing your tasks.</p>

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
            <label style={styles.label} htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              required
              autoFocus
              value={form.name}
              onChange={handleChange("name")}
              placeholder="Juan dela Cruz"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange("email")}
              placeholder="you@example.com"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange("password")}
              placeholder="••••••••"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="re_password">Confirm password</label>
            <input
              id="re_password"
              type="password"
              required
              value={form.re_password}
              onChange={handleChange("re_password")}
              placeholder="••••••••"
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? <span style={styles.spinner} /> : "Create account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <span onClick={onBackToLogin} style={styles.link}>Sign in</span>
        </p>
      </div>
      <style>{globalStyles}</style>
    </div>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital@0;1&family=DM+Sans:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  input::placeholder { color: #bbb0a4; }
  input:focus { outline: none; border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const styles: Record<string, CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#f9fafb",
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
      "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "2.5rem 2.25rem",
    width: "100%",
    maxWidth: "400px",
    position: "relative",
    animation: "fadeUp 0.45s ease both",
    boxShadow: "0 2px 32px rgba(99,102,241,0.08)",
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
    background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: "'Lora', serif",
    fontSize: "18px",
    color: "#1f2937",
    letterSpacing: "-0.3px",
  },
  heading: {
    fontFamily: "'Lora', serif",
    fontSize: "26px",
    fontWeight: "400",
    color: "#1f2937",
    letterSpacing: "-0.5px",
    marginBottom: "6px",
  },
  subheading: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "1.75rem",
    lineHeight: "1.5",
  },
  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "13px",
    color: "#991b1b",
    marginBottom: "1.25rem",
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
    color: "#6b7280",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "14px",
    color: "#1f2937",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "9px",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "'DM Sans', sans-serif",
  },
  submitBtn: {
    marginTop: "0.5rem",
    width: "100%",
    padding: "11px",
    background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "500",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: "0.02em",
    boxShadow: "0 4px 12px rgba(99,102,241,0.25)",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  footer: {
    textAlign: "center",
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "1.5rem",
  },
  link: {
    color: "#6366f1",
    fontWeight: "500",
    cursor: "pointer",
  },
  successIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    color: "#fff",
    margin: "0 auto 1.25rem",
  },
};