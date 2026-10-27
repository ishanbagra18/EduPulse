export type ThemeName = "light" | "dark";

export const lightTheme = {
  name: "light" as ThemeName,
  colors: {
    background: "#f7f7fb",
    card: "#ffffff",
    text: "#111827",
    muted: "#6b7280",
    primary: "#2563eb",
    border: "#e6e9ef",
    success: "#16a34a",
    danger: "#dc2626",
  },
  spacing: {
    s: 8,
    m: 16,
    l: 24,
  },
  radius: 10,
  shadow: { elevation: 2 },
};

export const darkTheme = {
  name: "dark" as ThemeName,
  colors: {
    background: "#0b1220",
    card: "#0f1724",
    text: "#e6eef8",
    muted: "#93a3bd",
    primary: "#3b82f6",
    border: "#172033",
    success: "#16a34a",
    danger: "#ef4444",
  },
  spacing: {
    s: 8,
    m: 16,
    l: 24,
  },
  radius: 10,
  shadow: { elevation: 2 },
};

export const THEME_KEY = "@sms:theme";
