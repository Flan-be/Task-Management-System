import { useState, useEffect, CSSProperties } from "react";
import API from "./API.tsx";

interface ProfilePageProps {
  onComplete: () => void;
}

export default function ProfilePage({ onComplete }: ProfilePageProps) {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [fetching, setFetching] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await API.get("auth/users/me/");
        setName(res.data.name || "");
        setEmail(res.data.email || "");
      } catch {
        setError("Could not load your profile.");
      } finally {
        setFetching(false);
      }
    };
    loadUser();
  }, []);

  if (fetching) {
    return (
      <div style={styles.loadingRoot}>
        <span style={styles.loadingSpinner} />
        <p style={styles.loadingText}>Loading your profile…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      {/* AppBar — matches Dashboard exactly */}
      <div style={styles.appBar}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" style={{ marginRight: 10 }}>
          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
        </svg>
        <span style={styles.appBarTitle}>Task Manager</span>
        {name && <span style={styles.appBarName}>{name}</span>}
      </div>

      {/* Page body */}
      <div style={styles.body}>
        <div style={styles.card}>
          {/* Avatar */}
          <div style={styles.avatarWrap}>
            <div style={styles.avatar}>
              {name ? name.charAt(0).toUpperCase() : "?"}
            </div>
            <h1 style={styles.heading}>{name || "—"}</h1>
            <p style={styles.emailText}>{email || "—"}</p>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          {/* Fields */}
          <div style={styles.fields}>
            <div style={styles.sectionLabel}>Account Info</div>

            <div style={styles.row}>
              <span style={styles.rowLabel}>Full name</span>
              <span style={styles.rowValue}>
                {name || <em style={styles.empty}>Not set</em>}
              </span>
            </div>

            <div style={styles.divider} />

            <div style={styles.row}>
              <span style={styles.rowLabel}>Email address</span>
              <span style={styles.rowValue}>
                {email || <em style={styles.empty}>Not set</em>}
              </span>
            </div>
          </div>

          {/* Action */}
          <div style={styles.actions}>
            <button onClick={onComplete} style={styles.continueBtn}>
              Go to Dashboard →
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  loadingRoot: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f9fafb",
    gap: "12px",
    fontFamily: "'Inter', sans-serif",
  },
  loadingSpinner: {
    width: "28px",
    height: "28px",
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  loadingText: {
    fontSize: "14px",
    color: "#6b7280",
    fontFamily: "'Inter', sans-serif",
  },
  root: {
    minHeight: "100vh",
    background: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', sans-serif",
  },

  // AppBar — mirrors Dashboard's gradient bar
  appBar: {
    display: "flex",
    alignItems: "center",
    background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
    boxShadow: "0 4px 12px rgba(99,102,241,0.15)",
    padding: "16px 24px",
    color: "#fff",
  },
  appBarTitle: {
    fontSize: "20px",
    fontWeight: 700,
    letterSpacing: "-0.5px",
    flex: 1,
  },
  appBarName: {
    fontSize: "14px",
    opacity: 0.85,
  },

  // Body
  body: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
  },
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    padding: "2.5rem 2rem",
    width: "100%",
    maxWidth: "420px",
    animation: "fadeUp 0.4s ease both",
  },

  // Avatar block
  avatarWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "2rem",
  },
  avatar: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "12px",
    boxShadow: "0 4px 12px rgba(99,102,241,0.25)",
  },
  heading: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1f2937",
    letterSpacing: "-0.3px",
    marginBottom: "4px",
  },
  emailText: {
    fontSize: "14px",
    color: "#6b7280",
  },

  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "13px",
    color: "#991b1b",
    marginBottom: "1.25rem",
  },

  // Field rows
  fields: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "1.5rem",
  },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#6366f1",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    padding: "8px 16px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "13px 16px",
    gap: "1rem",
  },
  rowLabel: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#6b7280",
    flexShrink: 0,
  },
  rowValue: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#1f2937",
    textAlign: "right" as const,
  },
  empty: {
    color: "#d1d5db",
    fontStyle: "italic",
    fontSize: "13px",
  },
  divider: {
    height: "1px",
    background: "#e5e7eb",
    margin: "0 16px",
  },

  // Button
  actions: {
    display: "flex",
    justifyContent: "flex-end",
  },
  continueBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(99,102,241,0.25)",
    letterSpacing: "0.01em",
  },
};