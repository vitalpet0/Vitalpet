// src/components/ErrorBoundary.jsx
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, err: null };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, err };
  }
  componentDidCatch(err, info) {
    // log optionnel
    console.error(`[ErrorBoundary ${this.props.name || ""}]`, err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
          <b>Oups.</b> La section <code>{this.props.name || "page"}</code> a
          rencontré une erreur.
        </div>
      );
    }
    return this.props.children;
  }
}
