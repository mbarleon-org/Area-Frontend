/**
 * Converts canvas nodes and connections into a workflow structure compatible with the API.
 *
 * Based on the workflow structure:
 * - triggers: nodes that have trigger modules (e.g., webhooks.receive, cron.schedule)
 * - actions: nodes that have action modules (e.g., gmail.send_email, core.debug_print)
 * - parents: determined by the connections (lines) between nodes
 */

export type EndpointRef = {
  nodeId?: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  offset?: number;
  worldX?: number;
  worldY?: number;
  index?: number;
};

export type LineItem = {
  a: EndpointRef;
  b: EndpointRef;
  stroke?: string;
  strokeWidth?: number;
};

export type NodeItem = {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  label?: string;
  icon?: string;
  module?: any;
  connectionPoints?: Array<{ side: 'left' | 'right' | 'top' | 'bottom'; offset: number; size?: number }>;
  inputs?: Record<string, string>;
  outputs?: Record<string, string>;
  options?: Record<string, any>;
  credential_id?: string;
};

export type WorkflowTrigger = {
  name: string;
  type: string;
  path?: string;
  cron?: string;
  interval?: string;
  credential_id?: string;
  options?: Record<string, any>;
};

export type WorkflowAction = {
  id: string;
  name: string;
  inputs?: Record<string, string>;
  outputs?: Record<string, string>;
  parents: string[];
  credential_id?: string;
};

export type Workflow = {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  owners: string[];
  users: string[];
  userTeams: string[];
  ownerTeams: string[];
};

/**
 * Determines if a module is a trigger by checking if it has triggers defined
 */
function isTriggerModule(moduleData: any): boolean {
  if (!moduleData)
    return false;
  const triggers = moduleData.triggers || {};
  return Object.keys(triggers).length > 0;
}

/**
 * Determines if a module has actions defined
 */
function isActionModule(moduleData: any): boolean {
  if (!moduleData)
    return false;
  const actions = moduleData.actions || {};
  return Object.keys(actions).length > 0;
}

/**
 * Gets the first trigger type from a module
 */
function getTriggerType(moduleData: any): string | null {
  if (!moduleData?.triggers)
    return null;
  const triggerKeys = Object.keys(moduleData.triggers);
  return triggerKeys.length > 0 ? triggerKeys[0] : null;
}

/**
 * Gets the first action type from a module
 */
function getActionType(moduleData: any): string | null {
  if (!moduleData?.actions)
    return null;
  const actionKeys = Object.keys(moduleData.actions);
  return actionKeys.length > 0 ? actionKeys[0] : null;
}

/**
 * Finds all parent nodes for a given node based on connections
 * A parent is a node that connects TO this node (line.b.nodeId === nodeId)
 */
function findParentNodes(nodeId: string, lines: LineItem[], nodes: NodeItem[]): string[] {
  const parentIds: string[] = [];

  for (const line of lines) {
    // If this node is the target (b) of a connection, the source (a) is a parent
    if (line.b.nodeId === nodeId && line.a.nodeId) {
      const parentNode = nodes.find(n => n.id === line.a.nodeId);
      if (parentNode && parentNode.label)
        parentIds.push(parentNode.label);
    }
    // Also check reverse direction - if connected from left side, it's likely receiving
    if (line.a.nodeId === nodeId && line.b.nodeId) {
      // Check if connection is coming INTO this node (left side = input)
      if (line.a.side === 'left') {
        const parentNode = nodes.find(n => n.id === line.b.nodeId);
        if (parentNode && parentNode.label)
          parentIds.push(parentNode.label);
      }
    }
  }

  return [...new Set(parentIds)]; // Remove duplicates
}

/**
 * Generates a slug-friendly ID from a name
 */
function generateSlugId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 50);
}

/**
 * Determines the trigger path based on workflow ID and trigger name
 */
function generateTriggerPath(workflowId: string, triggerType: string): string | undefined {
  if (triggerType === 'webhooks.receive')
    return `/webhook/${workflowId}`;
  if (triggerType === 'websocket.receive')
    return `/websocket/${workflowId}`;
  return undefined;
}

/**
 * Main function to convert canvas nodes and lines to a workflow structure
 */
export function convertCanvasToWorkflow(
  nodes: NodeItem[],
  lines: LineItem[],
  workflowConfig: {
    name: string;
    description: string;
    version?: string;
    enabled?: boolean;
  }
): Workflow {
  const triggers: WorkflowTrigger[] = [];
  const actions: WorkflowAction[] = [];

  const workflowId = generateSlugId(workflowConfig.name);

  // Separate nodes into triggers and actions
  for (const node of nodes) {
    if (!node.module)
        continue;

    const moduleData = node.module;
    const nodeName = node.label || node.id;

    if (isTriggerModule(moduleData)) {
      // This is a trigger node
      const triggerType = getTriggerType(moduleData);
      if (triggerType) {
        const trigger: WorkflowTrigger = {
          name: nodeName,
          type: triggerType,
        };

        // Add path for webhook/websocket triggers
        const path = generateTriggerPath(workflowId, triggerType);
        if (path)
          trigger.path = path;

        // Add options if configured
        if (node.options)
          trigger.options = node.options;

        // Add cron/interval for schedule triggers
        if (triggerType === 'cron.schedule') {
          if (node.options?.cron)
            trigger.cron = node.options.cron;
          if (node.options?.interval)
            trigger.interval = node.options.interval;
        }

        // Add credential_id if configured
        if (node.credential_id)
          trigger.credential_id = node.credential_id;

        triggers.push(trigger);
      }
    }

    if (isActionModule(moduleData)) {
      // This is an action node
      const actionType = getActionType(moduleData);
      if (actionType) {
        const parents = findParentNodes(node.id, lines, nodes);

        const action: WorkflowAction = {
          id: actionType,
          name: nodeName,
          parents,
        };

        // Add inputs if configured
        if (node.inputs && Object.keys(node.inputs).length > 0)
          action.inputs = node.inputs;

        // Add outputs if configured
        if (node.outputs && Object.keys(node.outputs).length > 0)
          action.outputs = node.outputs;

        // Add credential_id if configured
        if (node.credential_id)
          action.credential_id = node.credential_id;

        actions.push(action);
      }
    }
  }

  return {
    id: workflowId,
    name: workflowConfig.name,
    version: workflowConfig.version || '1.0.0',
    description: workflowConfig.description,
    enabled: workflowConfig.enabled ?? true,
    triggers,
    actions,
    owners: [],
    users: [],
    userTeams: [],
    ownerTeams: [],
  };
}

/**
 * Validates a workflow structure before sending to API
 */
export function validateWorkflow(workflow: Workflow): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!workflow.name || workflow.name.trim() === '')
    errors.push('Workflow name is required');

  if (!workflow.id || workflow.id.trim() === '')
    errors.push('Workflow ID is required');

  if (workflow.triggers.length === 0)
    errors.push('At least one trigger is required');

  // Validate that all action parents exist
  const allNodeNames = [
    ...workflow.triggers.map(t => t.name),
    ...workflow.actions.map(a => a.name),
  ];

  for (const action of workflow.actions)
    for (const parent of action.parents)
      if (!allNodeNames.includes(parent))
        errors.push(`Action "${action.name}" references unknown parent "${parent}"`);

  return {
    valid: errors.length === 0,
    errors,
  };
}
