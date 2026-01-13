import React, { useState, useRef, useEffect } from 'react';
import SaveWorkflowModal from './SaveWorkflowModal';
import { convertCanvasToWorkflow, validateWorkflow, validateCanvasData, type NodeItem, type LineItem } from '../../utils/workflowConverter';
import { useApi } from '../../utils/UseApi';

type Props = {
  nodes?: NodeItem[];
  lines?: LineItem[];
  onRecenter?: () => void;
  saveModalOpen: boolean;
  setSaveModalOpen: (open: boolean) => void;
  initialName?: string;
  initialDescription?: string;
  initialEnabled?: boolean;
  existingWorkflowId?: string;
  existingWorkflowData?: any;
};

const TopBar: React.FC<Props> = ({ nodes = [], lines = [], onRecenter, saveModalOpen, setSaveModalOpen, initialName, initialDescription, initialEnabled, existingWorkflowId, existingWorkflowData }) => {
  const { post } = useApi();
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string[] | null>(null);

  const handleSaveWorkflow = async (config: { name: string; description: string; enabled: boolean }) => {
    setSaveLoading(true);
    setSaveError(null);

    try {
      if (!config.name.trim()) {
        console.log('Workflow name is required');
        setSaveError(['Workflow name is required']);
        setSaveLoading(false);
        return;
      }

      const canvasValidation = validateCanvasData(nodes, lines);
      if (!canvasValidation.valid) {
        setSaveError(canvasValidation.errors);
        setSaveLoading(false);
        return;
      }

      // Convert canvas to workflow
      const workflow = convertCanvasToWorkflow(nodes, lines, {
        name: config.name,
        description: config.description,
        enabled: config.enabled,
        existingData: existingWorkflowData,
      });

      if (existingWorkflowId)
        workflow.id = existingWorkflowId;

      // Validate workflow
      const validation = validateWorkflow(workflow);
      if (!validation.valid) {
        setSaveError(validation.errors);
        setSaveLoading(false);
        return;
      }

      // Send to API
      console.log('Saving workflow:', workflow);
      await post('/workflows', workflow);

      setSaveModalOpen(false);
      console.log('Workflow saved successfully:', workflow);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to save workflow';
      setSaveError([message]);
    } finally {
      setSaveLoading(false);
    }
  };

  const menus = [
    {
      key: 'file',
      label: 'File',
      items: [
        { label: 'Save workflow', action: () => setSaveModalOpen(true) },
        { label: 'Export as JSON', action: () => {
          const workflow = convertCanvasToWorkflow(nodes, lines, {
            name: 'Exported Workflow',
            description: 'Exported from canvas',
            existingData: existingWorkflowData,
          });
          const json = JSON.stringify(workflow, null, 2);
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `workflow-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }},
      ]
    },
    {
      key: 'view',
      label: 'View',
      items: [
        { label: 'Recenter', action: () => onRecenter?.() },
      ]
    },
  ];

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);
  const [hoverDropdownItem, setHoverDropdownItem] = useState<string | null>(null);

  const refs = {
    file: useRef<HTMLDivElement>(null),
    view: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    if (!openMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      const ref = refs[openMenu as keyof typeof refs];
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu]);

  return (
    <>
      <div style={styles.container} aria-hidden={false}>
        <div style={styles.items}>
          {menus.map(menu => (
            <div key={menu.key} ref={refs[menu.key as keyof typeof refs]} style={{ position: 'relative' }}>
              <button
                style={{ ...styles.buttons, background: hoverMenu === menu.key ? '#333' : 'transparent' }}
                onClick={() => setOpenMenu(openMenu === menu.key ? null : menu.key)}
                onMouseEnter={() => setHoverMenu(menu.key)}
                onMouseLeave={() => setHoverMenu(null)}
              >
                {menu.label}
              </button>
              {openMenu === menu.key && (
                <div style={styles.dropdown}>
                  {menu.items.map(item => (
                    <button
                      key={item.label}
                      style={{ ...styles.dropdownButton, background: hoverDropdownItem === item.label ? '#222' : 'transparent' }}
                      onClick={() => { item.action(); setOpenMenu(null); }}
                      onMouseEnter={() => setHoverDropdownItem(item.label)}
                      onMouseLeave={() => setHoverDropdownItem(null)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <SaveWorkflowModal
        isOpen={saveModalOpen}
        onClose={() => {
          setSaveModalOpen(false);
          setSaveError(null);
        }}
        onSave={handleSaveWorkflow}
        loading={saveLoading}
        error={saveError}
        initialName={initialName}
        initialDescription={initialDescription}
        initialEnabled={initialEnabled}
      />
    </>
  );
};

const styles = {
  container: {
    position: 'fixed' as 'fixed',
    left: 100,
    right: 0,
    top: 0,
    height: 25,
    background: '#141414',
    zIndex: 1600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'left',
    pointerEvents: 'auto' as 'auto',
    boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.2)',
    outline: '1px solid #222',
  },
  items: {
    display: 'flex',
    alignItems: 'center',
  },
  buttons: {
    padding: '4px 16px',
    fontSize: 14,
    background: 'transparent',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
  },
  dropdown: {
    position: 'absolute' as 'absolute',
    top: '100%',
    left: 0,
    background: 'transparent',
    border: '1px solid #ffffff68',
    borderRadius: 8,
    zIndex: 1700,
    minWidth: '200px',
  },
  dropdownButton: {
    width: '100%',
    padding: '8px 12px',
    fontSize: 12,
    background: 'transparent',
    color: '#ffffffff',
    border: 'none',
    textAlign: 'left' as 'left',
    cursor: 'pointer',
    opacity: 1,
    borderRadius: 8,
  },
};

export default TopBar;
