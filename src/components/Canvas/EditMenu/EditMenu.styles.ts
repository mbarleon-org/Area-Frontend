import React from 'react';

// --- MAIN CONTAINER ---
export const containerStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: "50%",
  transform: "translateX(-50%)",
  width: "30%",
  height: "100vh",
  backgroundColor: "#141414",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  padding: "16px",
  color: "#ffffff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  overflowY: "auto",
  zIndex: 2000,
  transition: "transform 0.45s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.3s ease",
};

// --- HEADER ---
export const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  marginBottom: "16px",
  borderBottom: "1px solid #333",
  paddingBottom: "8px",
};

export const closeIconStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#fff",
  fontSize: "18px",
  cursor: "pointer",
};

// --- TABS ---
export const tabContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: 4,
  width: '100%',
  borderBottom: '1px solid #333',
  marginBottom: 16,
};

export const tabStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: 'transparent',
  border: 'none',
  color: '#888',
  cursor: 'pointer',
  fontSize: 14,
  borderBottomWidth: '2px',
  borderBottomStyle: 'solid',
  borderBottomColor: 'transparent',
  transition: 'color 0.2s, border-color 0.2s',
};

export const activeTabStyle: React.CSSProperties = {
  color: '#fff',
  borderBottomColor: '#007acc',
};

// --- TAB CONTENT ---
export const tabContentStyle: React.CSSProperties = {
  width: '100%',
  flex: 1,
  overflowY: 'auto',
};

// --- INPUT FIELDS ---
export const inputContainerStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  marginBottom: 12,
};

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px",
  borderRadius: "4px",
  border: "1px solid #333",
  backgroundColor: "#1e1e1e",
  color: "#fff",
  fontSize: "15px",
  boxSizing: 'border-box',
  marginBottom: 0,
};

export const bodyInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid #333',
  backgroundColor: '#1e1e1e',
  color: '#fff',
  fontSize: '14px',
  boxSizing: 'border-box',
  minHeight: '160px',
  resize: 'vertical',
};

export const labelStyle: React.CSSProperties = {
  fontSize: "14px",
  marginBottom: "6px",
  color: "#ddd",
};

export const requiredStyle: React.CSSProperties = {
  color: '#ff6b6b',
  marginLeft: 4,
};

export const helpTextStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#888',
  marginBottom: 16,
  lineHeight: 1.5,
};

// --- CONNECTION SECTION ---
export const connectionBoxStyle: React.CSSProperties = {
  backgroundColor: '#252526',
  padding: 16,
  borderRadius: 6,
  border: '1px solid #333',
  marginBottom: 16,
  marginTop: 8,
};

export const connectionTitleStyle: React.CSSProperties = {
  color: '#fff',
  fontWeight: 600,
  marginBottom: 12,
  display: 'block',
  fontSize: 14,
};

export const loginFormStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

export const connectBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#007acc',
  color: 'white',
  border: 'none',
  borderRadius: 4,
  fontWeight: 500,
  marginTop: 4,
};

export const connectedRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#1e1e1e',
  padding: 8,
  borderRadius: 4,
};

export const connectedBadgeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  overflow: 'hidden',
};

export const statusDotStyle: React.CSSProperties = {
  color: '#4caf50',
  fontSize: 18,
  lineHeight: 0,
};

export const connectedTextStyle: React.CSSProperties = {
  fontSize: 13,
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  maxWidth: 180,
};

export const disconnectBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #444',
  color: '#bbb',
  fontSize: 11,
  padding: '4px 8px',
  borderRadius: 4,
  cursor: 'pointer',
};

export const hintTextStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#666',
  marginTop: 2,
  fontStyle: 'italic',
};

// --- CUSTOM FIELDS ---
export const customRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  marginBottom: 12,
  gap: 8,
};

export const delBtnStyle: React.CSSProperties = {
  marginBottom: 2,
  background: 'transparent',
  border: 'none',
  color: '#ff6b6b',
  cursor: 'pointer',
  padding: '8px',
  fontSize: 16,
};

export const addBoxStyle: React.CSSProperties = {
  display: 'flex',
  marginTop: 12,
  gap: 8,
  borderTop: '1px dashed #333',
  paddingTop: 12,
  marginBottom: 24,
};

export const addInputStyle: React.CSSProperties = {
  flex: 1,
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #333",
  backgroundColor: "#1e1e1e",
  color: "#fff",
  fontSize: "14px",
};

export const addBtnStyle: React.CSSProperties = {
  background: '#333',
  color: '#fff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
};

// --- INFO BOX & FOOTER ---
export const infoBoxStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  padding: '8px 12px',
  backgroundColor: '#1e1e1e',
  borderRadius: 4,
  marginTop: 8,
  fontSize: 13,
};

export const infoLabelStyle: React.CSSProperties = {
  color: '#888',
};

export const footerStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 16,
  paddingTop: 16,
  borderTop: "1px solid #333",
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
};

export const applyButtonStyle: React.CSSProperties = {
  padding: "8px 20px",
  backgroundColor: "#007acc",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: 500,
};

export const closeButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  backgroundColor: "transparent",
  border: "1px solid #444",
  color: "#ddd",
  borderRadius: "4px",
  cursor: "pointer",
};

// --- UTILITY: Combine styles ---
export const combineStyles = (...styles: (React.CSSProperties | undefined | false)[]): React.CSSProperties =>
  styles.filter(Boolean).reduce((acc, style) => ({ ...acc, ...style }), {}) as React.CSSProperties;
