import React from "react";

const COLORS = [
  "#22c55e", // Green
  "#3b82f6", // Blue
  "#a855f7", // Purple
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#8b5cf6", // Violet
];

const UserIcon = ({ email, size = "md", className = "", style = {} }) => {
  const getInitials = (email) => {
    if (!email) return "??";
    const namePart = email.split("@")[0];
    const parts = namePart.split(/[.\-_]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return namePart.substring(0, 2).toUpperCase();
  };

  const getColor = (email) => {
    if (!email) return COLORS[0];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COLORS.length;
    return COLORS[index];
  };

  const initials = getInitials(email);
  const backgroundColor = getColor(email);

  const sizeClass = {
    xs: "user-icon-xs",
    sm: "user-icon-sm",
    md: "user-icon-md",
    lg: "user-icon-lg",
  }[size] || "user-icon-md";

  return (
    <div
      className={`user-icon-bubble ${sizeClass} ${className}`}
      style={{ backgroundColor, ...style }}
      title={email}
    >
      <span>{initials}</span>
    </div>
  );
};

export default UserIcon;
