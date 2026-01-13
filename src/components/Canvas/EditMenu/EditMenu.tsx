import { forwardRef, useImperativeHandle } from 'react';
import type { EditMenuProps, EditMenuHandle } from './EditMenu.types';
import { useEditMenuLogic } from './useEditMenuLogic';
import { EditMenuTabs } from './EditMenuTabs';
import { EditMenuField } from './EditMenuField';
import { GmailConnection } from './GmailConnection';
import { CustomFieldsList } from './CustomFieldsList';
import {
  containerStyle,
  headerStyle,
  closeIconStyle,
  tabContentStyle,
  infoBoxStyle,
  infoLabelStyle,
  footerStyle,
  closeButtonStyle,
  inputContainerStyle,
  labelStyle,
  inputStyle,
} from './EditMenu.styles';

const EditMenu = forwardRef<EditMenuHandle, EditMenuProps>(
  ({ node, updateNode, onClose, credentials, refreshCredentials }, ref) => {
    const logic = useEditMenuLogic({ node, updateNode, onClose, credentials, refreshCredentials });

    useImperativeHandle(ref, () => ({ requestClose: logic.handleRequestClose }), [
      logic.handleRequestClose,
    ]);

    if (!node) return null;

    const containerTransform = `${containerStyle.transform} ${
      logic.visible ? ' translateY(0)' : ' translateY(80%)'
    }`;

    return (
      <div
        style={{
          ...containerStyle,
          transform: containerTransform,
          opacity: logic.visible ? 1 : 0,
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={headerStyle}>
          <h3 style={{ margin: 0 }}>Edit Node</h3>
          <button onClick={logic.handleRequestClose} style={closeIconStyle}>
            ✕
          </button>
        </div>

        {/* TABS */}
        <EditMenuTabs
          activeTab={logic.activeTab}
          setActiveTab={logic.setActiveTab}
          hasInputs={logic.hasInputs}
          hasOutputs={logic.hasOutputs}
          hasOptions={logic.hasOptions}
        />

        {/* TAB CONTENT */}
        <div style={tabContentStyle}>
          {/* --- GENERAL TAB --- */}
          {logic.activeTab === 'general' && (
            <>
              <EditMenuField
                label="Name"
                value={logic.name}
                onChange={logic.setName}
                placeholder="Node name..."
                inputRef={logic.nameRef}
              />

              {/* Gmail Connection - Only for Gmail modules */}
              {logic.isGmailModule && (
                <GmailConnection
                  connectedAccountLabel={logic.connectedAccountLabel}
                  availableCredentials={logic.availableCredentials}
                  selectedCredentialId={logic.selectedCredentialId}
                  authEmail={logic.authEmail}
                  authPassword={logic.authPassword}
                  isConnecting={logic.isConnecting}
                  onSelectCredential={logic.setSelectedCredentialId}
                  onEmailChange={logic.setAuthEmail}
                  onPasswordChange={logic.setAuthPassword}
                  onConnect={logic.handleConnect}
                />
              )}

              <div style={infoBoxStyle}>
                <span style={infoLabelStyle}>Type:</span>
                <span>
                  {logic.specs.isAction
                    ? 'Action'
                    : logic.specs.isTrigger
                    ? 'Trigger'
                    : 'Unknown'}
                </span>
              </div>
            </>
          )}

          {/* --- INPUTS TAB --- */}
          {logic.activeTab === 'inputs' && logic.hasInputs && (
            <CustomFieldsList
              fields={logic.inputs}
              specs={logic.specs.inputs}
              newKey={logic.newInputKey}
              onNewKeyChange={logic.setNewInputKey}
              onFieldChange={logic.updateInput}
              onFieldRemove={logic.removeInput}
              onFieldAdd={logic.addInput}
              placeholder="New input key..."
              helpText="Dynamic Inputs & Variables"
              isGmailModule={logic.isGmailModule}
            />
          )}

          {/* --- OUTPUTS TAB --- */}
          {logic.activeTab === 'outputs' && logic.hasOutputs && (
            <CustomFieldsList
              fields={logic.outputs}
              specs={logic.specs.outputs}
              newKey={logic.newOutputKey}
              onNewKeyChange={logic.setNewOutputKey}
              onFieldChange={logic.updateOutput}
              onFieldRemove={logic.removeOutput}
              onFieldAdd={logic.addOutput}
              placeholder="New output key..."
              helpText="Custom Outputs"
              isGmailModule={logic.isGmailModule}
            />
          )}

          {/* --- OPTIONS TAB --- */}
          {logic.activeTab === 'options' && logic.hasOptions && (
            <>
              {logic.specs.options.map((spec) => (
                <div key={spec.id} style={inputContainerStyle}>
                  <label style={labelStyle}>{spec.pretty_name}</label>
                  <input
                    value={logic.options[spec.id] || ''}
                    onChange={(e) => logic.updateOption(spec.id, e.target.value)}
                    style={inputStyle}
                  />
                </div>
              ))}
            </>
          )}
        </div>

        {/* FOOTER */}
        <div style={footerStyle}>
          <button onClick={logic.handleRequestClose} style={closeButtonStyle}>
            Close
          </button>
        </div>
      </div>
    );
  }
);

export default EditMenu;
