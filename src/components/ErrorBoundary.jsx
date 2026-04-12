/**
 * CTA Logistics — Error Boundary
 * Prevents WSOD · Catches React tree errors gracefully
 */

import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // En production, envoyer vers un service de monitoring (Sentry, etc.)
    console.error("[CTA ErrorBoundary]", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Nettoyer le state corrompu si nécessaire
    try {
      window.localStorage.removeItem("cta_mission_state");
    } catch {}
    window.location.href = "/client";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0A0B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            background: "rgba(20,20,21,0.65)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 16,
            padding: 40,
            textAlign: "center",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(239,68,68,0.10)",
              border: "1.5px solid rgba(239,68,68,0.30)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 28,
            }}
          >
            ⚠
          </div>

          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#E5E7EB",
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            Incident Système Détecté
          </h2>

          <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 8, lineHeight: 1.6 }}>
            Une erreur inattendue a été interceptée par le Command Center.
          </p>

          {this.state.error && (
            <div
              style={{
                background: "#141415",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 24,
                textAlign: "left",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "#EF4444",
                  fontFamily: "monospace",
                  margin: 0,
                  wordBreak: "break-all",
                }}
              >
                {this.state.error.message}
              </p>
            </div>
          )}

          <button
            onClick={this.handleReset}
            style={{
              background: "#3B82F6",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "14px 28px",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Réinitialiser & Redémarrer
          </button>
        </div>
      </div>
    );
  }
}
