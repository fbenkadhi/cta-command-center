/**
 * CTA Logistics — GlassCard
 * Core Glassmorphism primitive réutilisable
 */

import { forwardRef } from "react";

const VARIANTS = {
  default: {
    background:   "rgba(20, 20, 21, 0.65)",
    borderColor:  "rgba(255, 255, 255, 0.05)",
  },
  active: {
    background:   "rgba(20, 20, 21, 0.75)",
    borderColor:  "rgba(255, 255, 255, 0.10)",
  },
  gold: {
    background:   "rgba(20, 20, 21, 0.75)",
    borderColor:  "rgba(201, 165, 92, 0.20)",
  },
  success: {
    background:   "rgba(16, 185, 129, 0.03)",
    borderColor:  "rgba(16, 185, 129, 0.25)",
  },
  danger: {
    background:   "rgba(239, 68, 68, 0.03)",
    borderColor:  "rgba(239, 68, 68, 0.25)",
  },
  accent: {
    background:   "rgba(59, 130, 246, 0.04)",
    borderColor:  "rgba(59, 130, 246, 0.20)",
  },
};

/**
 * @param {Object}  props
 * @param {'default'|'active'|'gold'|'success'|'danger'|'accent'} props.variant
 * @param {number}  props.padding
 * @param {Object}  props.style      — inline style overrides
 * @param {string}  props.className  — Tailwind classes
 * @param {boolean} props.interactive — ajoute cursor pointer + hover border
 * @param {Function} props.onClick
 */
const GlassCard = forwardRef(function GlassCard(
  {
    children,
    variant   = "default",
    padding   = 28,
    style     = {},
    className = "",
    interactive = false,
    onClick,
    ...rest
  },
  ref
) {
  const v = VARIANTS[variant] ?? VARIANTS.default;

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={className}
      style={{
        background:          v.background,
        backdropFilter:      "blur(40px)",
        WebkitBackdropFilter:"blur(40px)",
        border:              `1px solid ${v.borderColor}`,
        borderRadius:        16,
        padding,
        transition:          "border-color 0.4s ease, background 0.4s ease, transform 0.2s ease",
        cursor:              interactive ? "pointer" : undefined,
        // Hover is handled via CSS class if needed, but we support style overrides
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
});

export default GlassCard;

// ── Sub-components for composition ────────────────────────────────────────────

export const GlassHeader = ({ icon: Icon, title, subtitle, badge }) => (
  <div
    style={{
      display:      "flex",
      alignItems:   "center",
      gap:          12,
      marginBottom: 20,
    }}
  >
    {Icon && (
      <div
        style={{
          width:           36,
          height:          36,
          borderRadius:    10,
          background:      "rgba(59,130,246,0.12)",
          border:          "1px solid rgba(59,130,246,0.20)",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          flexShrink:      0,
        }}
      >
        <Icon size={18} strokeWidth={1.2} color="#3B82F6" />
      </div>
    )}
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontSize:    14,
          fontWeight:  600,
          color:       "#E5E7EB",
          fontFamily:  "'Inter', sans-serif",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: "#6B7280", fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
          {subtitle}
        </div>
      )}
    </div>
    {badge}
  </div>
);

export const GlassDivider = ({ style }) => (
  <div
    style={{
      height:     1,
      background: "rgba(255,255,255,0.05)",
      margin:     "20px 0",
      ...style,
    }}
  />
);
