import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { useApi } from '../../utils/UseApi';

type NodeItem = {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  label?: string;
  module?: any;
  inputs?: Record<string, string>;
  outputs?: Record<string, string>;
  options?: Record<string, any>;
  credential_id?: string;
} | null;

type Props = {
  node: NodeItem;
  updateNode: (patch: Partial<NonNullable<NodeItem>>) => void;
  onClose: () => void;
};

export type EditMenuHandle = { requestClose: () => void };

type InputSpec = {
  id: string;
  pretty_name: string;
  type: string;
  required?: boolean;
  description?: string;
};

type OptionSpec = {
  id: string;
  pretty_name: string;
  type: string;
  description?: string;
};

const EditMenu = forwardRef<EditMenuHandle, Props>(({ node, updateNode, onClose }, ref) => {
  const { get, post } = useApi();
  const nameRef = useRef<HTMLInputElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const [name, setName] = useState(node?.label || "");
  const [inputs, setInputs] = useState<Record<string, string>>(node?.inputs || {});
  const [outputs, setOutputs] = useState<Record<string, string>>(node?.outputs || {});
  const [options, setOptions] = useState<Record<string, any>>(node?.options || {});

  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'inputs' | 'outputs' | 'options'>('general');
  const [newInputKey, setNewInputKey] = useState("");
  const [newOutputKey, setNewOutputKey] = useState("");

  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAccountLabel, setConnectedAccountLabel] = useState<string | null>(null);

  const getModuleSpecs = () => {
    if (!node?.module)
      return { inputs: [], outputs: [], options: [], isAction: false, isTrigger: false };
    const moduleData = node.module;
    let inputSpecs: InputSpec[] = [];
    let outputSpecs: InputSpec[] = [];
    let optionSpecs: OptionSpec[] = [];
    let isAction = false;
    let isTrigger = false;

    if (moduleData.actions && Object.keys(moduleData.actions).length > 0) {
      isAction = true;
      const spec = moduleData.actions[Object.keys(moduleData.actions)[0]]?.spec;
      if (spec)
        inputSpecs = spec.inputs || []; outputSpecs = spec.outputs || [];
    }
    if (moduleData.triggers && Object.keys(moduleData.triggers).length > 0) {
      isTrigger = true;
      const spec = moduleData.triggers[Object.keys(moduleData.triggers)[0]]?.spec;
      if (spec)
        optionSpecs = spec.options || []; outputSpecs = spec.outputs || [];
    }
    return { inputs: inputSpecs, outputs: outputSpecs, options: optionSpecs, isAction, isTrigger };
  };

  const specs = getModuleSpecs();

  useEffect(() => {
    setName(node?.label || "");
    setInputs(node?.inputs || {});
    setOutputs(node?.outputs || {});
    setOptions(node?.options || {});
  }, [node]);

  useEffect(() => {
    requestAnimationFrame(() => {
      setVisible(true);
      nameRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    if (node?.credential_id) {
      get(`/credentials/${node.credential_id}`)
        .then((cred: any) => {
          const label = cred?.metadata?.email || cred?.name || "Account linked";
          setConnectedAccountLabel(label);
        })
        .catch(() => {
          setConnectedAccountLabel(`ID: ${node.credential_id?.slice(0, 8)}...`);
        });
    } else
      setConnectedAccountLabel(null);
  }, [node?.credential_id, get]);

  const handleRequestClose = () => {
    setVisible(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, 460);
  };

  useImperativeHandle(ref, () => ({ requestClose: handleRequestClose }), [handleRequestClose]);

  const handleApply = () => {
    const formatForEngine = (val: string) => {
      if (!val)
        return val;
      const trimmed = val.trim();

      if (trimmed.startsWith('${{') || trimmed.startsWith('body.') || trimmed.startsWith('parent.') || trimmed.startsWith('nodes.'))
        return trimmed;

      const safeVal = trimmed.replace(/'/g, "\\'");
      return `\${{ '${safeVal}' }}`;
    };

    const formattedInputs = Object.entries(inputs).reduce((acc, [key, value]) => {
      acc[key] = formatForEngine(value);
      return acc;
    }, {} as Record<string, string>);

    updateNode({
      label: name,
      inputs: Object.keys(formattedInputs).length > 0 ? formattedInputs : undefined,
      outputs: Object.keys(outputs).length > 0 ? outputs : undefined,
      options: Object.keys(options).length > 0 ? options : undefined,
    });
  };

  const updateMap = (setter: any) => (id: string, val: any) => setter((p: any) => ({ ...p, [id]: val }));
  const removeKey = (setter: any) => (id: string) => setter((p: any) => { const n = { ...p }; delete n[id]; return n; });

  const handleConnect = async () => {
    if (!authEmail || !authPassword)
      return;
    setIsConnecting(true);

    try {
      let list: any[] = [];

      try {
        const res = await get('/credentials');
        list = Array.isArray(res) ? res : [];
      } catch (getErr: any) {
        if (getErr.response && getErr.response.status === 404) {
          console.warn("GET /credentials 404 -> Empty list.");
          list = [];
        } else
          throw getErr;
      }

      const existing = list.find((c: any) =>
        (c.provider === 'gmail' || c.provider === 'google') &&
        c.metadata?.email === authEmail
      );

      let targetId = existing?.id;

      if (!targetId) {
        const payload = {
          id: Date.now().toString(),
          name: authEmail,
          type: 'gmail.email_app_password',
          version: '1.0.1',
          description: 'Gmail Credential via App Password',
          data: {
            email: authEmail,
            token: authPassword,
            password: authPassword,
            app_password: authPassword
          }
        };

        const newCred = await post('/credentials', payload);
        targetId = newCred?.id;
      }

      if (targetId) {
        updateNode({ credential_id: targetId });
        setConnectedAccountLabel(authEmail);
        setAuthPassword("");
      } else
        throw new Error("Unable to retrieve credential ID.");

    } catch (err: any) {
      console.error("Error connecting credential:", err);
      alert(`Error connecting credential: ${err.response?.status === 404 ? "API not found" : err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnectedAccountLabel(null);
    updateNode({ credential_id: undefined });
  };

  if (!node)
    return null;

  const hasInputs = specs.inputs.length > 0;
  const isSetFields = node.module?.actions?.['core.set_fields'] !== undefined || (specs.outputs.length === 0 && specs.isAction);
  const hasOutputs = specs.outputs.length > 0 || isSetFields;
  const hasOptions = specs.options.length > 0;

  return (
    <div
      style={{
        ...styles.container,
        transform: `${styles.container.transform} ${visible ? ' translateY(0)' : ' translateY(80%)'}`,
        opacity: visible ? 1 : 0,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER */}
      <div style={styles.header}>
        <h3 style={{ margin: 0 }}>Edit Node</h3>
        <button onClick={handleRequestClose} style={styles.closeIcon}>✕</button>
      </div>

      {/* TABS */}
      <div style={styles.tabContainer}>
        <button style={{ ...styles.tab, ...(activeTab === 'general' ? styles.activeTab : {}) }} onClick={() => setActiveTab('general')}>General</button>
        {hasInputs && <button style={{ ...styles.tab, ...(activeTab === 'inputs' ? styles.activeTab : {}) }} onClick={() => setActiveTab('inputs')}>Inputs</button>}
        {hasOutputs && <button style={{ ...styles.tab, ...(activeTab === 'outputs' ? styles.activeTab : {}) }} onClick={() => setActiveTab('outputs')}>Outputs</button>}
        {hasOptions && <button style={{ ...styles.tab, ...(activeTab === 'options' ? styles.activeTab : {}) }} onClick={() => setActiveTab('options')}>Options</button>}
      </div>

      <div style={styles.tabContent}>

        {/* --- GENERAL TAB --- */}
        {activeTab === 'general' && (
          <>
            <div style={styles.inputContainer}>
              <label style={styles.label}>Name</label>
              <input
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Node name..."
                style={styles.input}
              />
            </div>

            {/* CONNECTION ZONE */}
            {(specs.isAction || specs.isTrigger) && (
              <div style={styles.connectionBox}>
                <label style={styles.connectionTitle}>
                  Log in (Gmail)
                </label>

                {connectedAccountLabel ? (
                  // Is connected
                  <div style={styles.connectedRow}>
                    <div style={styles.connectedBadge}>
                      <span style={styles.statusDot}>●</span>
                      <span style={styles.connectedText}>{connectedAccountLabel}</span>
                    </div>
                    <button onClick={handleDisconnect} style={styles.disconnectBtn}>Disconnect</button>
                  </div>
                ) : (
                  // Form connection mode
                  <div style={styles.loginForm}>
                    <input
                      placeholder="Email (ex: john.smith@gmail.com)"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      style={styles.input}
                    />
                    <input
                      type="password"
                      placeholder="App Password (16 chars)"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      style={styles.input}
                    />
                    <button
                      onClick={handleConnect}
                      disabled={isConnecting || !authEmail || !authPassword}
                      style={{
                        ...styles.connectBtn,
                        opacity: (isConnecting || !authEmail || !authPassword) ? 0.6 : 1,
                        cursor: (isConnecting || !authEmail || !authPassword) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isConnecting ? 'Logging in...' : 'Link this account'}
                    </button>
                    <div style={styles.hintText}>
                      Use a Google app password (Security &gt; App Passwords).
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={styles.infoBox}>
              <span style={styles.infoLabel}>Type:</span>
              <span>{specs.isAction ? 'Action' : specs.isTrigger ? 'Trigger' : 'Unknown'}</span>
            </div>
          </>
        )}

        {/* --- INPUTS TAB --- */}
        {activeTab === 'inputs' && hasInputs && (
          <>
            <p style={styles.helpText}>Dynamic Inputs & Variables</p>
            {specs.inputs.map((spec) => (
              <div key={spec.id} style={styles.inputContainer}>
                <label style={styles.label}>
                  {spec.pretty_name} {spec.required && <span style={styles.required}>*</span>}
                </label>
                <input
                  value={inputs[spec.id] || ''}
                  onChange={(e) => updateMap(setInputs)(spec.id, e.target.value)}
                  style={styles.input}
                />
              </div>
            ))}
            {/* Custom Inputs */}
            {Object.entries(inputs)
               .filter(([k]) => !specs.inputs.find(s => s.id === k))
               .map(([k, v]) => (
               <div key={k} style={styles.customRow}>
                 <div style={{flex:1}}>
                    <label style={styles.label}>{k}</label>
                    <input value={v} onChange={(e) => updateMap(setInputs)(k, e.target.value)} style={styles.input}/>
                 </div>
                 <button onClick={() => removeKey(setInputs)(k)} style={styles.delBtn}>✕</button>
               </div>
            ))}
            <div style={styles.addBox}>
               <input value={newInputKey} onChange={e => setNewInputKey(e.target.value)} placeholder="New input key..." style={styles.addInput} />
               <button onClick={() => { if(newInputKey.trim()) { updateMap(setInputs)(newInputKey.trim(), ""); setNewInputKey(""); }}} style={styles.addBtn}>Add</button>
            </div>
          </>
        )}

        {/* --- OUTPUTS TAB --- */}
        {activeTab === 'outputs' && hasOutputs && (
          <>
            <p style={styles.helpText}>Custom Outputs</p>
            {specs.outputs.map((spec) => (
              <div key={spec.id} style={styles.inputContainer}>
                <label style={styles.label}>{spec.pretty_name}</label>
                <input value={outputs[spec.id] || ''} onChange={(e) => updateMap(setOutputs)(spec.id, e.target.value)} style={styles.input} />
              </div>
            ))}
            {Object.entries(outputs).filter(([k]) => !specs.outputs.find(s => s.id === k)).map(([k, v]) => (
               <div key={k} style={styles.customRow}>
                 <div style={{flex:1}}>
                    <label style={styles.label}>{k}</label>
                    <input value={v} onChange={(e) => updateMap(setOutputs)(k, e.target.value)} style={styles.input}/>
                 </div>
                 <button onClick={() => removeKey(setOutputs)(k)} style={styles.delBtn}>✕</button>
               </div>
            ))}
            <div style={styles.addBox}>
               <input value={newOutputKey} onChange={e => setNewOutputKey(e.target.value)} placeholder="New output key..." style={styles.addInput} />
               <button onClick={() => { if(newOutputKey.trim()) { updateMap(setOutputs)(newOutputKey.trim(), ""); setNewOutputKey(""); }}} style={styles.addBtn}>Add</button>
            </div>
          </>
        )}

        {/* --- OPTIONS TAB --- */}
        {activeTab === 'options' && hasOptions && (
          <>
            {specs.options.map((spec) => (
              <div key={spec.id} style={styles.inputContainer}>
                <label style={styles.label}>{spec.pretty_name}</label>
                <input value={options[spec.id] || ''} onChange={(e) => updateMap(setOptions)(spec.id, e.target.value)} style={styles.input} />
              </div>
            ))}
          </>
        )}
      </div>

      <div style={styles.footer}>
        <button onClick={handleRequestClose} style={styles.closeButton}>Close</button>
        <button onClick={handleApply} style={styles.applyButton}>Apply</button>
      </div>
    </div>
  );
});

// --- STYLES ---
const styles: { [k: string]: React.CSSProperties } = {
  container: {
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
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: "16px",
    borderBottom: "1px solid #333",
    paddingBottom: "8px",
  },
  closeIcon: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "18px",
    cursor: "pointer",
  },
  tabContainer: {
    display: 'flex',
    gap: 4,
    width: '100%',
    borderBottom: '1px solid #333',
    marginBottom: 16,
  },
  tab: {
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
  },
  activeTab: {
    color: '#fff',
    borderBottomColor: '#007acc',
  },
  tabContent: {
    width: '100%',
    flex: 1,
    overflowY: 'auto',
  },
  inputContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    marginBottom: 12,
  },
  input: {
    width: "100%",
    padding: "9px",
    borderRadius: "4px",
    border: "1px solid #333",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    fontSize: "15px",
    boxSizing: 'border-box',
    marginBottom: 0,
  },
  label: {
    fontSize: "14px",
    marginBottom: "6px",
    color: "#ddd",
  },
  required: {
    color: '#ff6b6b',
    marginLeft: 4,
  },
  helpText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 16,
    lineHeight: 1.5,
  },

  // Styles Connection Section
  connectionBox: {
    backgroundColor: '#252526',
    padding: 16,
    borderRadius: 6,
    border: '1px solid #333',
    marginBottom: 16,
    marginTop: 8,
  },
  connectionTitle: {
    color: '#fff',
    fontWeight: 600,
    marginBottom: 12,
    display: 'block',
    fontSize: 14,
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  connectBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#007acc',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    fontWeight: 500,
    marginTop: 4,
  },
  connectedRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 8,
    borderRadius: 4,
  },
  connectedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  statusDot: {
    color: '#4caf50',
    fontSize: 18,
    lineHeight: 0,
  },
  connectedText: {
    fontSize: 13,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    maxWidth: 180,
  },
  disconnectBtn: {
    background: 'transparent',
    border: '1px solid #444',
    color: '#bbb',
    fontSize: 11,
    padding: '4px 8px',
    borderRadius: 4,
    cursor: 'pointer',
  },
  hintText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic',
  },

  // Styles Custom Fields
  customRow: {
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 8,
  },
  delBtn: {
    marginBottom: 2,
    background: 'transparent',
    border: 'none',
    color: '#ff6b6b',
    cursor: 'pointer',
    padding: '8px',
    fontSize: 16,
  },
  addBox: {
    display: 'flex',
    marginTop: 12,
    gap: 8,
    borderTop: '1px dashed #333',
    paddingTop: 12,
    marginBottom: 24,
  },
  addInput: {
    flex: 1,
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #333",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    fontSize: "14px",
  },
  addBtn: {
    background: '#333',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 13,
  },

  // Info Box & Footer
  infoBox: {
    display: 'flex',
    gap: 8,
    padding: '8px 12px',
    backgroundColor: '#1e1e1e',
    borderRadius: 4,
    marginTop: 8,
    fontSize: 13,
  },
  infoLabel: {
    color: '#888',
  },
  footer: {
    width: "100%",
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid #333",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  applyButton: {
    padding: "8px 20px",
    backgroundColor: "#007acc",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: 500,
  },
  closeButton: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    border: "1px solid #444",
    color: "#ddd",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default EditMenu;
