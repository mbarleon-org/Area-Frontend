import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useApi } from '../../../utils/UseApi';
import { getModuleProvider } from '../../../utils/workflowConverter';
import type {
  NodeItem,
  TabType,
  ModuleSpecs,
  InputSpec,
  OptionSpec,
  UseEditMenuLogicReturn,
  CredentialItem,
} from './EditMenu.types';

type UseEditMenuLogicProps = {
  node: NodeItem;
  updateNode: (patch: Partial<NonNullable<NodeItem>>) => void;
  onClose: () => void;
  credentials: CredentialItem[];
  refreshCredentials: () => Promise<void> | void;
};

export const useEditMenuLogic = ({
  node,
  updateNode,
  onClose,
  credentials,
  refreshCredentials,
}: UseEditMenuLogicProps): UseEditMenuLogicReturn => {
  const { get, post } = useApi();
  const nameRef = useRef<HTMLInputElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const updateNodeRef = useRef(updateNode);
  useEffect(() => { updateNodeRef.current = updateNode; }, [updateNode]);

  const stripEngineFormat = (val: string): string => {
    if (!val)
      return val;
    const trimmed = val.trim();
    const match = trimmed.match(/^\$\{\{\s*'(.*)'\s*\}\}$/);
    if (match && match[1] !== undefined)
      return match[1].replace(/\\'/g, "'");
    return trimmed;
  };

  // --- State ---
  const [name, setName] = useState(node?.label || "");
  const [inputs, setInputs] = useState<Record<string, string>>(node?.inputs || {});
  const [outputs, setOutputs] = useState<Record<string, string>>(node?.outputs || {});
  const [options, setOptions] = useState<Record<string, any>>(node?.options || {});

  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [newInputKey, setNewInputKey] = useState("");
  const [newOutputKey, setNewOutputKey] = useState("");

  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAccountLabel, setConnectedAccountLabel] = useState<string | null>(null);
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(node?.credential_id || null);

  const provider = useMemo(() => getModuleProvider(node?.module), [node?.module]);
  console.log('Credentials in EditMenu logic:', credentials)
  const availableCredentials = useMemo(() => {
    if (!credentials) return [];

    return credentials.filter((c) => {
      // 1. Vérifie si le provider est explicitement 'gmail'
      const isGmailProvider = c.provider === 'gmail';

      // 2. Vérifie le type (ex: 'gmail.email_app_password')
      // On regarde si le type commence par 'gmail.' ou contient 'gmail'
      const isGmailType = c.type === 'gmail.email_app_password' || c.type?.startsWith('gmail.');

      // 3. Fallback : on peut aussi checker le nom si besoin, mais le type est plus sûr
      return isGmailProvider || isGmailType;
    });
  }, [credentials]);

  const labelFromCredential = useCallback((cred: CredentialItem | undefined | null) => {
    if (!cred)
      return null;
    return cred.name || cred.metadata?.email || cred.id;
  }, []);

  // --- Compute module specs ---
  const getModuleSpecs = useCallback((): ModuleSpecs => {
    if (!node?.module) {
      return { inputs: [], outputs: [], options: [], isAction: false, isTrigger: false };
    }

    const moduleData = node.module;
    let inputSpecs: InputSpec[] = [];
    let outputSpecs: InputSpec[] = [];
    let optionSpecs: OptionSpec[] = [];
    let isAction = false;
    let isTrigger = false;

    if (moduleData.actions && Object.keys(moduleData.actions).length > 0) {
      isAction = true;
      const spec = moduleData.actions[Object.keys(moduleData.actions)[0]]?.spec;
      if (spec) {
        inputSpecs = spec.inputs || [];
        outputSpecs = spec.outputs || [];
      }
    }

    if (moduleData.triggers && Object.keys(moduleData.triggers).length > 0) {
      isTrigger = true;
      const spec = moduleData.triggers[Object.keys(moduleData.triggers)[0]]?.spec;
      if (spec) {
        optionSpecs = spec.options || [];
        outputSpecs = spec.outputs || [];
      }
    }

    return { inputs: inputSpecs, outputs: outputSpecs, options: optionSpecs, isAction, isTrigger };
  }, [node?.module]);

  const specs = getModuleSpecs();

  // --- Effects ---
  useEffect(() => {
    setName(node?.label || "");
    const rawInputs = node?.inputs || {};
    const unwrappedInputs = Object.entries(rawInputs).reduce((acc, [k, v]) => {
      acc[k] = stripEngineFormat(v);
      return acc;
    }, {} as Record<string, string>);
    setInputs(unwrappedInputs);
    setOutputs(node?.outputs || {});
    setOptions(node?.options || {});

    const initialCredential = node?.credential_id || availableCredentials[0]?.id || null;
    setSelectedCredentialId(initialCredential);
    const current = availableCredentials.find((c) => c.id === initialCredential);
    setConnectedAccountLabel(labelFromCredential(current));
  }, [node, availableCredentials, labelFromCredential]);

  useEffect(() => {
    requestAnimationFrame(() => {
      setVisible(true);
      nameRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    const current = availableCredentials.find((c) => c.id === selectedCredentialId);
    setConnectedAccountLabel(labelFromCredential(current));
  }, [availableCredentials, selectedCredentialId, labelFromCredential]);

  // --- Handlers ---
  const handleRequestClose = useCallback(() => {
    setVisible(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, 460);
  }, [onClose]);

  const formatForEngine = (val: string): string => {
    if (!val) return val;
    const trimmed = val.trim();

    if (
      trimmed.startsWith('${{') ||
      trimmed.startsWith('body.') ||
      trimmed.startsWith('parent.') ||
      trimmed.startsWith('nodes.')
    ) {
      return trimmed;
    }

    const safeVal = trimmed.replace(/'/g, "\\'");
    return `\${{ '${safeVal}' }}`;
  };

  const formatInputsMap = useCallback((map: Record<string, string>) =>
    Object.entries(map).reduce((acc, [k, v]) => {
      acc[k] = formatForEngine(v);
      return acc;
    }, {} as Record<string, string>), [formatForEngine]);

  const handleConnect = useCallback(async () => {
    if (!authEmail || !authPassword) return;
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
        } else {
          throw getErr;
        }
      }

      const existing = list.find(
        (c: any) =>
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
            app_password: authPassword,
          },
        };

        const newCred = await post('/credentials', payload);
        targetId = newCred?.id;
      }

      if (targetId) {
        setSelectedCredentialId(targetId);
        setConnectedAccountLabel(authEmail);
        setAuthPassword("");
        await refreshCredentials();
      } else {
        throw new Error("Unable to retrieve credential ID.");
      }
    } catch (err: any) {
      console.error("Error connecting credential:", err);
      alert(
        `Error connecting credential: ${
          err.response?.status === 404 ? "API not found" : err.message
        }`
      );
    } finally {
      setIsConnecting(false);
    }
  }, [authEmail, authPassword, get, post, refreshCredentials]);

  const handleDisconnect = useCallback(() => {
    setConnectedAccountLabel(null);
    updateNode({ credential_id: undefined });
    setSelectedCredentialId(null);
  }, [updateNode]);

  useEffect(() => {
    updateNodeRef.current({ credential_id: selectedCredentialId || undefined });
  }, [selectedCredentialId]);

  // --- Field update helpers ---
  const updateInput = useCallback((id: string, value: string) => {
    setInputs((prev) => {
      const next = { ...prev, [id]: value };
      const formatted = formatInputsMap(next);
      updateNode({
        label: name,
        inputs: Object.keys(formatted).length ? formatted : undefined,
        outputs: Object.keys(outputs).length ? outputs : undefined,
        options: Object.keys(options).length ? options : undefined,
      });
      return next;
    });
  }, [formatInputsMap, name, outputs, options, updateNode]);

  const updateOutput = useCallback((id: string, value: string) => {
    setOutputs((prev) => {
      const next = { ...prev, [id]: value };
      updateNode({
        label: name,
        inputs: Object.keys(inputs).length ? formatInputsMap(inputs) : undefined,
        outputs: Object.keys(next).length ? next : undefined,
        options: Object.keys(options).length ? options : undefined,
      });
      return next;
    });
  }, [name, inputs, options, updateNode, formatInputsMap]);

  const updateOption = useCallback((id: string, value: string) => {
    setOptions((prev) => {
      const next = { ...prev, [id]: value };
      updateNode({
        label: name,
        inputs: Object.keys(inputs).length ? formatInputsMap(inputs) : undefined,
        outputs: Object.keys(outputs).length ? outputs : undefined,
        options: Object.keys(next).length ? next : undefined,
      });
      return next;
    });
  }, [name, inputs, outputs, updateNode, formatInputsMap]);

  const removeInput = useCallback((id: string) => {
    setInputs((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const removeOutput = useCallback((id: string) => {
    setOutputs((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const addInput = useCallback(() => {
    if (newInputKey.trim()) {
      const key = newInputKey.trim();
      setInputs((prev) => {
        const next = { ...prev, [key]: "" };
        const formatted = formatInputsMap(next);
        updateNode({
          label: name,
          inputs: Object.keys(formatted).length ? formatted : undefined,
          outputs: Object.keys(outputs).length ? outputs : undefined,
          options: Object.keys(options).length ? options : undefined,
        });
        return next;
      });
      setNewInputKey("");
    }
  }, [newInputKey, formatInputsMap, name, outputs, options, updateNode]);

  const addOutput = useCallback(() => {
    if (newOutputKey.trim()) {
      const key = newOutputKey.trim();
      setOutputs((prev) => {
        const next = { ...prev, [key]: "" };
        updateNode({
          label: name,
          inputs: Object.keys(inputs).length ? formatInputsMap(inputs) : undefined,
          outputs: Object.keys(next).length ? next : undefined,
          options: Object.keys(options).length ? options : undefined,
        });
        return next;
      });
      setNewOutputKey("");
    }
  }, [newOutputKey, name, inputs, options, updateNode, formatInputsMap]);

  const setNameAndUpdate = useCallback((value: string) => {
    setName(value);
    updateNode({
      label: value,
      inputs: Object.keys(inputs).length ? formatInputsMap(inputs) : undefined,
      outputs: Object.keys(outputs).length ? outputs : undefined,
      options: Object.keys(options).length ? options : undefined,
    });
  }, [inputs, outputs, options, updateNode, formatInputsMap]);

  // --- Computed values ---
  const hasInputs = specs.inputs.length > 0;
  const isSetFields =
    node?.module?.actions?.['core.set_fields'] !== undefined ||
    (specs.outputs.length === 0 && specs.isAction);
  const hasOutputs = specs.outputs.length > 0 || isSetFields;
  const hasOptions = specs.options.length > 0;

  // Check if this is a Gmail module
  const isGmailModule = provider === 'gmail';

  return {
    // State
    name,
    inputs,
    outputs,
    options,
    visible,
    activeTab,
    newInputKey,
    newOutputKey,
    authEmail,
    authPassword,
    isConnecting,
    connectedAccountLabel,
    selectedCredentialId,
    availableCredentials,
    specs,
    provider,

    // Refs
    nameRef,

    // Setters
    setName: setNameAndUpdate,
    setActiveTab,
    setNewInputKey,
    setNewOutputKey,
    setAuthEmail,
    setAuthPassword,
    setSelectedCredentialId,

    // Handlers
    handleRequestClose,
    handleConnect,
    handleDisconnect,
    updateInput,
    updateOutput,
    updateOption,
    removeInput,
    removeOutput,
    addInput,
    addOutput,

    // Computed
    hasInputs,
    hasOutputs,
    hasOptions,
    isGmailModule,
  };
};
