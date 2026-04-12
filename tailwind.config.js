/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg:           "#0A0A0B",
        elevated:     "#141415",
        surface:      "#1A1A1C",
        "surface-hover": "#222224",

        // Text hierarchy
        "txt-primary":   "#E5E7EB",
        "txt-secondary": "#9CA3AF",
        "txt-tertiary":  "#6B7280",
        "txt-muted":     "#4B5563",

        // Accent palette
        accent:       "#3B82F6",
        "accent-muted":  "rgba(59,130,246,0.12)",
        "accent-border": "rgba(59,130,246,0.20)",

        // Status
        success:      "#10B981",
        "success-muted": "rgba(16,185,129,0.10)",
        danger:       "#EF4444",
        "danger-muted":  "rgba(239,68,68,0.10)",

        // Gold premium
        gold:         "#C9A55C",
        "gold-muted":    "rgba(201,165,92,0.10)",

        // Glass system
        "glass-border":  "rgba(255,255,255,0.05)",
        "glass-active":  "rgba(255,255,255,0.10)",
      },

      fontFamily: {
        sans: ["'Inter'", "-apple-system", "'SF Pro Display'", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "'Fira Code'", "monospace"],
      },

      borderRadius: {
        sm:  "8px",
        DEFAULT: "12px",
        lg:  "16px",
        xl:  "20px",
      },

      backdropBlur: {
        glass: "40px",
      },

      boxShadow: {
        "gold-glow":    "0 0 20px rgba(201,165,92,0.15)",
        "accent-glow":  "0 0 20px rgba(59,130,246,0.15)",
        "success-glow": "0 0 8px rgba(16,185,129,0.40)",
      },

      animation: {
        spin:       "spin 0.8s linear infinite",
        "scan-line": "scanLine 1.5s ease-in-out infinite",
        "fade-in":  "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.35s cubic-bezier(0.25,0.46,0.45,0.94) forwards",
        pulse:      "pulse 2s ease-in-out infinite",
      },

      keyframes: {
        scanLine: {
          "0%,100%": { top: "10%" },
          "50%":     { top: "85%" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(12px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
