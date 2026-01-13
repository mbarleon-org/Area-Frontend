import React, { useEffect, useState } from 'react';
import type { GmailConnectionProps } from './EditMenu.types';
import {
  connectionBoxStyle,
  connectionTitleStyle,
  connectedRowStyle,
  connectedBadgeStyle,
  statusDotStyle,
  connectedTextStyle,
  disconnectBtnStyle,
  loginFormStyle,
  inputStyle,
  connectBtnStyle,
  hintTextStyle,
} from './EditMenu.styles';

export const GmailConnection: React.FC<GmailConnectionProps> = ({
  connectedAccountLabel,
  availableCredentials,
  selectedCredentialId,
  authEmail,
  authPassword,
  isConnecting,
  onSelectCredential,
  onEmailChange,
  onPasswordChange,
  onConnect,
}) => {
  const isDisabled = isConnecting || !authEmail || !authPassword;
  const selected = availableCredentials.find((c) => c.id === selectedCredentialId);
  const selectedLabel = selected?.name || selected?.metadata?.email || selected?.id;
  const [showNewCredentialForm, setShowNewCredentialForm] = useState(false);

  useEffect(() => {
    if (selectedCredentialId) {
      setShowNewCredentialForm(false);
    }
  }, [selectedCredentialId]);

  return (
    <div style={connectionBoxStyle}>
      <label style={connectionTitleStyle}>Log in (Gmail)</label>

        {selectedCredentialId && (
        <div style={{ ...connectedRowStyle, marginBottom: 12 }}>
          <div style={connectedBadgeStyle}>
          <span style={statusDotStyle}>●</span>
          <span style={connectedTextStyle}>{selectedLabel || connectedAccountLabel}</span>
          </div>
        </div>
        )}

        {/* Dropdown menu for saved accounts */}
        {availableCredentials.length > 0 && (
        <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Use a saved account:</p>
            <select
            value={selectedCredentialId || ''}
            onChange={(e) => onSelectCredential(e.target.value || null)}
            style={{ ...inputStyle, cursor: 'pointer', border: '1px solid #007acc' }}
            >
            <option value="">-- Select a saved account --</option>
            {availableCredentials.map((cred) => (
                <option key={cred.id} value={cred.id}>
                {cred.name || cred.metadata?.email || cred.id}
                </option>
            ))}
            </select>
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowNewCredentialForm(true)}
                style={{ ...connectBtnStyle, width: '100%' }}
              >
                Link a new account
              </button>
            </div>
        </div>
        )}
        {(showNewCredentialForm || !selectedCredentialId || connectedAccountLabel === null) && (
        // Login form
        <div style={loginFormStyle}>
          <input
            placeholder="Email (ex: john.smith@gmail.com)"
            value={authEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="App Password (16 chars)"
            value={authPassword}
            onChange={(e) => onPasswordChange(e.target.value)}
            style={inputStyle}
          />
          <button
            onClick={onConnect}
            disabled={isDisabled}
            style={{
              ...connectBtnStyle,
              opacity: isDisabled ? 0.6 : 1,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            {isConnecting ? 'Logging in...' : 'Link this account'}
          </button>
          {showNewCredentialForm && availableCredentials.length > 0 && (
            <button
              type="button"
              onClick={() => setShowNewCredentialForm(false)}
              style={{ ...disconnectBtnStyle, marginTop: 6 }}
            >
              Cancel
            </button>
          )}
          <div style={hintTextStyle}>
            Use a Google app password (Security &gt; App Passwords).
          </div>
        </div>
      )}
    </div>
  );
};
