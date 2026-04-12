/**
 * CTA Logistics — UI Primitives
 * Button, Label, Pill, Spinner, PriceRow, PhaseIndicator
 */

import { useState } from "react";
import { Check } from "lucide-react";

// ── Tokens (mirrored from Tailwind config) ────────────────────────────────────
export const T = {
  bg:           "#0A0A0B",
  elevated:     "#141415",
  surface:      "#1A1A1C",
  primary:      "#E5E7EB",
  secondary:    "#9CA3AF",
  tertiary:     "#6B7280",
  muted:        "#4B5563",
  accent:       "#3B82F6",
  accentMuted:  "rgba(59,130,246,0.12)",
  accentBorder: "rgba(59,130,246,0.20)",
  success:      "#10B981",
  successMuted: "rgba(16,185,129,0.10)",
  danger:       "#EF4444",
  dangerMuted:  "rgba(239,68,68,0.10)",
  gold:         "#C9A55C",
  goldMuted:    "rgba(201,165,92,0.10)",
  glass:        "rgba(20,20,21,0.65)",
  glassBorder:  "rgba(255,255,255,0.05)",
  glassActive:  "rgba(255,255,255,0.10)",
  radius:       12,
  radiusSm:     8,
  radiusLg:     16,
  font:         "'Inter', -apple-system, 'SF Pro Display', sans-serif",
  mono:         "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
};

// ── Button ────────────────────────────────────────────────────────────────────

const BUTTON_VARIANTS = {
  primary: { bg: T.accent,   text: "#fff"     },
  ghost:   { bg: "transparent", text: T.primary },
  success: { bg: T.success,  text: "#fff"     },
  gold:    { bg: T.gold,     text: "#0A0A0B"  },
  danger:  { bg: T.danger,   text: "#fff"     },
};

export const Button = ({
  children,
  onClick,
  disabled = false,
  variant  = "primary",
  style: sx,
  type = "button",
}) => {
  const [pressed, setPressed] = useState(false);
  const v = BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        background:   disabled ? T.surface : v.bg,
        color:        disabled ? T.muted : v.text,
        border:       variant === "ghost" ? `1px solid ${T.glassBorder}` : "none",
        borderRadius: T.radius,
        padding:      "14px 24px",
        fontSize:     14,
        fontWeight:   600,
        fontFamily:   T.font,
        letterSpacing:"-0.01em",
        cursor:       disabled ? "not-allowed" : "pointer",
        transition:   "all 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
        transform:    pressed && !disabled ? "scale(0.98)" : "scale(1)",
        opacity:      disabled ? 0.35 : 1,
        width:        "100%",
        display:      "flex",
        alignItems:   "center",
        justifyContent:"center",
        gap:          10,
        WebkitFontSmoothing: "antialiased",
        ...sx,
      }}
    >
      {children}
    </button>
  );
};

// ── Label ─────────────────────────────────────────────────────────────────────

export const Label = ({ children, required, style }) => (
  <label
    style={{
      display:       "block",
      fontSize:      11,
      fontWeight:    500,
      color:         T.tertiary,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginBottom:  8,
      fontFamily:    T.font,
      WebkitFontSmoothing: "antialiased",
      ...style,
    }}
  >
    {children}
    {required && (
      <span style={{ color: T.danger, marginLeft: 4 }}>*</span>
    )}
  </label>
);

// ── Pill ──────────────────────────────────────────────────────────────────────

export const Pill = ({ children, color = T.accent, style }) => (
  <span
    style={{
      display:      "inline-flex",
      alignItems:   "center",
      gap:          4,
      background:   `${color}18`,
      color,
      border:       `1px solid ${color}30`,
      borderRadius: 100,
      padding:      "3px 12px",
      fontSize:     11,
      fontWeight:   600,
      fontFamily:   T.font,
      letterSpacing:"0.02em",
      WebkitFontSmoothing: "antialiased",
      flexShrink:   0,
      ...style,
    }}
  >
    {children}
  </span>
);

// ── Spinner ───────────────────────────────────────────────────────────────────

export const Spinner = ({ size = 20, color = T.accent }) => (
  <div
    style={{
      width:        size,
      height:       size,
      border:       `2px solid ${color}30`,
      borderTopColor: color,
      borderRadius: "50%",
      animation:    "ctaSpin 0.8s linear infinite",
      flexShrink:   0,
    }}
  />
);

// ── PriceRow ──────────────────────────────────────────────────────────────────

export const PriceRow = ({ label, value, bold, color }) => (
  <div
    style={{
      display:        "flex",
      justifyContent: "space-between",
      alignItems:     "center",
      padding:        "10px 0",
      borderBottom:   bold ? "none" : `1px solid ${T.glassBorder}`,
    }}
  >
    <span
      style={{
        fontSize:   bold ? 15 : 13,
        fontWeight: bold ? 700 : 400,
        color:      bold ? T.primary : T.secondary,
        fontFamily: T.font,
        letterSpacing: "-0.01em",
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize:   bold ? 17 : 14,
        fontWeight: bold ? 700 : 500,
        color:      color ?? (bold ? T.primary : T.secondary),
        fontFamily: T.mono,
        letterSpacing: "-0.02em",
      }}
    >
      {value}
    </span>
  </div>
);

// ── PhaseIndicator ────────────────────────────────────────────────────────────

export const PhaseIndicator = ({ done, active, number }) => (
  <div
    style={{
      width:          28,
      height:         28,
      borderRadius:   "50%",
      background:     done ? T.successMuted : active ? T.accentMuted : T.elevated,
      border:         `1.5px solid ${done ? T.success : active ? T.accent : T.glassBorder}`,
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      flexShrink:     0,
      transition:     "all 0.3s ease",
    }}
  >
    {done ? (
      <Check size={14} strokeWidth={2} color={T.success} />
    ) : (
      <span style={{ fontSize: 12, fontWeight: 700, color: active ? T.accent : T.muted }}>
        {number}
      </span>
    )}
  </div>
);

// ── Input Styles ──────────────────────────────────────────────────────────────

export const INPUT_BASE = {
  width:         "100%",
  boxSizing:     "border-box",
  background:    T.bg,
  border:        `1px solid ${T.glassBorder}`,
  borderRadius:  T.radiusSm,
  color:         T.primary,
  fontSize:      15,
  fontFamily:    T.font,
  outline:       "none",
  letterSpacing: "-0.01em",
  WebkitFontSmoothing: "antialiased",
  transition:    "border-color 0.3s ease",
};

export const INPUT_STYLE = {
  ...INPUT_BASE,
  padding: "13px 16px 13px 42px",
};

export const INPUT_STYLE_PLAIN = {
  ...INPUT_BASE,
  padding: "13px 16px",
};

export const SELECT_STYLE = {
  ...INPUT_STYLE_PLAIN,
  appearance:          "none",
  WebkitAppearance:    "none",
  MozAppearance:       "none",
  backgroundImage:     `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234B5563' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat:    "no-repeat",
  backgroundPosition:  "right 14px center",
  paddingRight:        36,
  cursor:              "pointer",
};
