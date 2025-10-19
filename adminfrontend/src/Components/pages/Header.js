// src/Header.js
import React from "react";
import { FiBell, FiLogOut } from "react-icons/fi";

/** Small avatar with initials fallback */
function Avatar({ src, name = "", size = 36 }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  const base = {
    width: size,
    height: size,
    borderRadius: "9999px",
    background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
    color: "#1f2937",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: Math.max(12, Math.floor(size / 2.8)),
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.06)",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || "profile"}
        style={{ ...base, objectFit: "cover" }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }
  return <div style={base}>{initials || "U"}</div>;
}

/**
 * Modern, attractive header (sticky, glassy, responsive)
 *
 * Props:
 * - title?: string (defaults to "EDUCORE" for every page)
 * - name?: string (user display name)
 * - role?: string
 * - email?: string
 * - avatarUrl?: string
 * - onLogout?: () => void
 * - onBellClick?: () => void
 */
export default function Header({
  title = "EDUCORE",
  name,
  role,
  email,
  avatarUrl,
  onLogout,
  onBellClick,
}) {
  // Fallback to localStorage if props not provided (makes integration easy)
  const lsFirst = (localStorage.getItem("firstName") || "").trim();
  const lsLast = (localStorage.getItem("lastName") || "").trim();
  const lsEmail = (localStorage.getItem("email") || "").trim();
  const lsRole = (localStorage.getItem("role") || "").trim();
  const lsAvatar =
    (localStorage.getItem("avatar") ||
      localStorage.getItem("profilePic") ||
      localStorage.getItem("profile") ||
      "").trim();

  const displayName =
    (name && name.trim()) ||
    [lsFirst, lsLast].filter(Boolean).join(" ") ||
    (email && email.trim()) ||
    lsEmail ||
    "User";
  const displayRole = (role && role.trim()) || lsRole || "-";
  const displayAvatar = (avatarUrl && avatarUrl.trim()) || lsAvatar || "";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backdropFilter: "saturate(180%) blur(8px)",
        WebkitBackdropFilter: "saturate(180%) blur(8px)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.72) 100%)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* Brand / Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          {/* Brand mark */}
          <div
            aria-hidden
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background:
                "conic-gradient(from 180deg at 50% 50%, #4F46E5, #22D3EE, #10B981, #4F46E5)",
              boxShadow: "0 6px 18px rgba(79,70,229,0.25)",
            }}
          />
          <div
            title={title}
            style={{
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: "0.3px",
              color: "#111827",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>
        </div>

        {/* Right-side controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
          }}
        >
          {/* Bell */}
          <button
            type="button"
            title="Notifications"
            onClick={onBellClick || (() => {})}
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
              background:
                "linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)",
              borderRadius: 12,
              padding: 10,
              cursor: "pointer",
              outline: "none",
              transition: "transform 120ms ease, box-shadow 120ms ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <FiBell size={18} color="#374151" />
          </button>

          {/* Profile */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "6px 10px",
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.06)",
              background:
                "linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
              minWidth: 0,
            }}
          >
            <Avatar src={displayAvatar} name={displayName} size={36} />
            <div
              style={{
                lineHeight: 1.1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#111827",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 180,
                }}
                title={displayName}
              >
                {displayName}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 180,
                }}
                title={displayRole}
              >
                {displayRole}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            title="Logout"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid rgba(239, 68, 68, 0.2)",
              background:
                "linear-gradient(180deg, #EF4444 0%, #DC2626 100%)",
              color: "#fff",
              borderRadius: 12,
              padding: "10px 14px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(220,38,38,0.25)",
              transition: "transform 120ms ease, box-shadow 120ms ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(1px)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
