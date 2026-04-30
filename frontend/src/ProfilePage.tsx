import { useState, useEffect, useRef, CSSProperties } from "react";
import API from "./API.tsx";

const CLOUDINARY_UPLOAD_PRESET = "test123"; // from Cloudinary dashboard
const CLOUDINARY_CLOUD_NAME = "dr3y2xhrw";       // from Cloudinary dashboard

interface ProfilePageProps {
  onComplete: () => void;
}

export default function ProfilePage({ onComplete }: ProfilePageProps) {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [fetching, setFetching] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await API.get("auth/users/me/");
        setName(res.data.name || "");
        setEmail(res.data.email || "");
        setProfileImage(res.data.profile_image || "");
      } catch {
        setError("Could not load your profile.");
      } finally {
        setFetching(false);
      }
    };
    loadUser();
  }, []);

  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const cloudData = await cloudRes.json();
      const imageUrl = cloudData.secure_url;

      // 2. Save URL to backend
      await API.patch("auth/profile/image/", { profile_image: imageUrl });
      setProfileImage(imageUrl);
    } catch {
      setError("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = () => { setDraft(name); setEditing(true); };

  const handleSave = async () => {
    try {
      await API.patch("auth/users/me/", { name: draft });
      setName(draft);
      setEditing(false);
    } catch {
      setError("Failed to update name.");
    }
  };

  if (fetching) {
    return (
      <div style={styles.loadingRoot}>
        <span style={styles.loadingSpinner} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      {/* AppBar */}
      <div style={styles.appBar}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" style={{ marginRight: 10 }}>
          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
        </svg>
        <span style={styles.appBarTitle}>Task Manager</span>
        {name && <span style={styles.appBarName}>{name}</span>}
      </div>

      <div style={styles.body}>
        <div style={styles.card}>
          {/* Avatar / image upload */}
          <div style={styles.avatarWrap}>
            <div style={styles.avatarOuter} onClick={handleImageClick} data-avatar>
              {uploading ? (
                <div style={styles.avatarOverlay}>
                  <span style={styles.loadingSpinner} />
                </div>
              ) : (
                <>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" style={styles.avatarImg} />
                  ) : (
                    <div style={styles.avatar}>
                      {name ? name.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                  <div style={styles.avatarOverlay}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M12 15.2A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4zm7-12h-1.4l-1.7-2H8.1L6.4 3.2H5A3 3 0 0 0 2 6.2v12A3 3 0 0 0 5 21h14a3 3 0 0 0 3-3V6.2a3 3 0 0 0-3-3z"/>
                    </svg>
                    <span style={{ fontSize: "11px", marginTop: "2px" }}>
                      {profileImage ? "Change" : "Upload"}
                    </span>
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <h1 style={styles.heading}>{name || "—"}</h1>
            <p style={styles.emailText}>{email || "—"}</p>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          {/* Fields */}
          <div style={styles.fields}>
            <div style={styles.sectionLabel}>Account Info</div>

            {/* Editable name row */}
            <div style={styles.row}>
              <span style={styles.rowLabel}>Full name</span>
              {editing ? (
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    style={styles.inlineInput}
                    autoFocus
                  />
                  <button onClick={handleSave} style={styles.saveBtn}>Save</button>
                  <button onClick={() => setEditing(false)} style={styles.cancelBtn}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={styles.rowValue}>{name || <em style={styles.empty}>Not set</em>}</span>
                  <button onClick={handleEdit} style={styles.editBtn}>Edit</button>
                </div>
              )}
            </div>

            <div style={styles.divider} />

            <div style={styles.row}>
              <span style={styles.rowLabel}>Email address</span>
              <span style={styles.rowValue}>{email || <em style={styles.empty}>Not set</em>}</span>
            </div>
          </div>

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
  /* show camera overlay on hover */
  div[data-avatar]:hover > div:last-child { opacity: 1 !important; }
`}</style>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  loadingRoot: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f9fafb",
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
  root: {
    minHeight: "100vh",
    background: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', sans-serif",
  },
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
  avatarWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "2rem",
  },
  avatarOuter: {
    position: "relative",
    width: "88px",
    height: "88px",
    borderRadius: "50%",
    cursor: "pointer",
    marginBottom: "12px",
    overflow: "hidden",
  },
  avatar: {
    width: "88px",
    height: "88px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: 700,
    color: "#fff",
    boxShadow: "0 4px 12px rgba(99,102,241,0.25)",
  },
  avatarImg: {
    width: "88px",
    height: "88px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  avatarOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    opacity: 0,
    transition: "opacity 0.2s",
    borderRadius: "50%",
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
  inlineInput: {
    padding: "6px 10px",
    fontSize: "14px",
    border: "1px solid #6366f1",
    borderRadius: "6px",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    color: "#1f2937",
  },
  editBtn: {
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: 600,
    background: "none",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    color: "#6366f1",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
  saveBtn: {
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: 600,
    background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
  cancelBtn: {
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: 600,
    background: "none",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    color: "#6b7280",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
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
  },
};