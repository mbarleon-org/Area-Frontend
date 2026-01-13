import React from 'react';
import type { CustomFieldsListProps } from './EditMenu.types';
import {
  helpTextStyle,
  inputContainerStyle,
  labelStyle,
  requiredStyle,
  inputStyle,
  bodyInputStyle,
  customRowStyle,
  delBtnStyle,
  addBoxStyle,
  addInputStyle,
  addBtnStyle,
} from './EditMenu.styles';

export const CustomFieldsList: React.FC<CustomFieldsListProps> = ({
  fields,
  specs,
  newKey,
  onNewKeyChange,
  onFieldChange,
  onFieldRemove,
  onFieldAdd,
  placeholder,
  helpText,
  isGmailModule = false,
}) => {
  // Fields defined by specs
  const hiddenForGmail = new Set(['HTML Body', 'From']);
  const specFields = specs
    .filter((spec) => !(isGmailModule && hiddenForGmail.has(spec.pretty_name)))
    .map((spec) => {
      const isBody = spec.pretty_name?.toLowerCase().includes('body');
      return (
        <div key={spec.id} style={inputContainerStyle}>
          <label style={labelStyle}>
            {spec.pretty_name}
            {spec.required && <span style={requiredStyle}>*</span>}
          </label>
          {isBody ? (
            <textarea
              value={fields[spec.id] || ''}
              onChange={(e) => onFieldChange(spec.id, e.target.value)}
              style={bodyInputStyle}
            />
          ) : (
            <input
              value={fields[spec.id] || ''}
              onChange={(e) => onFieldChange(spec.id, e.target.value)}
              style={inputStyle}
            />
          )}
        </div>
      );
    });

  // Custom fields (not in specs)
  const customFields = Object.entries(fields)
    .filter(([k]) => !specs.find((s) => s.id === k))
    .map(([k, v]) => (
      <div key={k} style={customRowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>{k}</label>
          <input
            value={v}
            onChange={(e) => onFieldChange(k, e.target.value)}
            style={inputStyle}
          />
        </div>
        <button onClick={() => onFieldRemove(k)} style={delBtnStyle}>
          ✕
        </button>
      </div>
    ));

  return (
    <>
      <p style={helpTextStyle}>{helpText}</p>
      {specFields}
      {customFields}
      <div style={addBoxStyle}>
        <input
          value={newKey}
          onChange={(e) => onNewKeyChange(e.target.value)}
          placeholder={placeholder}
          style={addInputStyle}
        />
        <button onClick={onFieldAdd} style={addBtnStyle}>
          Add
        </button>
      </div>
    </>
  );
};
