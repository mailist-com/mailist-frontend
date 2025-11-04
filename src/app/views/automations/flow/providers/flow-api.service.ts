import {inject, Injectable} from "@angular/core";
import {IFlowState} from "../models/i-flow-state";
import {FlowState} from "../flow-state";
import {
  FCanvasChangeEvent,
  FCreateConnectionEvent, FCreateNodeEvent,
  FMoveNodesEvent,
  FReassignConnectionEvent,
  FSelectionChangeEvent
} from "@foblex/flow";
import {generateGuid} from "@foblex/utils";
import {IPoint, PointExtensions} from "@foblex/2d";
import {NodeType} from "../enums/node-type";
import {IFlowStateNode} from "../models/i-flow-state-node";
import {createGenericNode} from "./create-generic-node";
import {IFlowStateConnection} from "../models/i-flow-state-connection";
import {AutomationService} from "../../../../services/automation.service";

@Injectable({
  providedIn: 'root'
})
export class FlowApiService {

  private readonly _state = inject(FlowState);
  private readonly _automationService = inject(AutomationService);

  private _currentAutomationId: string | null = null;

  public getFlowById(flowId: string): IFlowState {
    this._currentAutomationId = flowId;
    console.log('[FlowApiService] Loading flow for ID:', flowId);

    // Try to load from localStorage first
    const storageKey = `automation_flow_${flowId}`;
    const savedFlow = localStorage.getItem(storageKey);

    console.log('[FlowApiService] Storage key:', storageKey);
    console.log('[FlowApiService] Found saved flow:', !!savedFlow);

    if (savedFlow) {
      try {
        const parsedFlow = JSON.parse(savedFlow);
        console.log('[FlowApiService] Parsed flow:', {
          nodeCount: Object.keys(parsedFlow.nodes || {}).length,
          connectionCount: Object.keys(parsedFlow.connections || {}).length,
          name: parsedFlow.name
        });
        return parsedFlow;
      } catch (e) {
        console.error('[FlowApiService] Error parsing saved flow:', e);
      }
    }

    // Return empty flow for new automations
    console.log('[FlowApiService] Returning empty flow');
    return {
      nodes: {},
      connections: {},
      name: 'Nowa automatyzacja'
    };
  }

  public saveFlow(flow: IFlowState, flowId: string): void {
    // Save flow data to localStorage for persistence
    const storageKey = `automation_flow_${flowId}`;
    console.log('[FlowApiService] Saving flow for ID:', flowId);
    console.log('[FlowApiService] Storage key:', storageKey);
    console.log('[FlowApiService] Flow data:', {
      nodeCount: Object.keys(flow.nodes || {}).length,
      connectionCount: Object.keys(flow.connections || {}).length,
      name: flow.name
    });
    localStorage.setItem(storageKey, JSON.stringify(flow));
    console.log('[FlowApiService] Flow saved successfully');
  }

  public resetFlow(flowId: string): void {
    // Clear from localStorage
    const storageKey = `automation_flow_${flowId}`;
    localStorage.removeItem(storageKey);
  }

  public getCurrentAutomationId(): string | null {
    return this._currentAutomationId;
  }

  public transformCanvas(event: FCanvasChangeEvent): void {
    this._state.update({
      transform: createTransformObject(event)
    }, 'transformCanvas');
  }

  public createNode(event: FCreateNodeEvent): void {
    // Use generic node creator that supports all node types
    const node = createGenericNode(event.data as NodeType, event.rect);

    this._state.create({
      nodes: {
        [node.id]: node
      },
      selection: {
        nodes: [node.id],
        connections: []
      }
    }, 'createNode');
  }

  public createConnection(event: FCreateConnectionEvent): void {
    if (!event.fInputId) {
      return;
    }
    const connection = createConnectionObject(event);
    this._state.create({
      connections: {
        [connection.id]: connection
      },
      selection: {
        nodes: [],
        connections: [connection.id]
      }
    });
  }

  public reassignConnection(event: FReassignConnectionEvent): void {
    if (!event.newTargetId) {
      return;
    }
    this._state.update({
      connections: {
        [event.connectionId]: {target: event.newTargetId}
      },
      selection: {
        nodes: [],
        connections: [event.connectionId]
      }
    });
  }

  public moveNodes(event: FMoveNodesEvent): void {
    this._state.update({
      nodes: createMoveNodesChangeObject(event.fNodes)
    }, 'moveNodes');
  }

  public changeSelection(event: FSelectionChangeEvent): void {
    this._state.update({
      selection: {
        nodes: [...event.fNodeIds],
        connections: [...event.fConnectionIds],
        groups: [...event.fGroupIds]
      }
    }, 'changeSelection');
  }

  public selectAll(state: IFlowState): void {
    this._state.update({
      selection: {
        nodes: [...Object.keys(state.nodes)],
        connections: [...Object.keys(state.connections)],
        groups: []
      }
    }, 'selectAll');
  }

  public removeConnection(outputId: string, state: IFlowState): void {
    const id = Object.values(state.connections).find(x => x.source === outputId)?.id;

    this._state.delete({
      connections: Object.fromEntries([id].map(id => [id, null])) as any
    }, 'removeConnection');
  }

  public removeSelected(state: IFlowState): void {
    const selectedNodeIds = state.selection?.nodes ?? [];
    const selectedConnIds = state.selection?.connections ?? [];
    if (!selectedConnIds.length && !selectedNodeIds.length) {
      return;
    }

    const connIdsToDelete = new Set<string>(selectedConnIds);
    const allConnections = Object.values(state.connections);
    for (const nodeId of selectedNodeIds) {
      const node = state.nodes[nodeId];
      if (!node) continue;

      this._findConnectionsUsedInNode(node, allConnections).forEach(cid => connIdsToDelete.add(cid));
    }

    this._state.delete({
      nodes: Object.fromEntries(selectedNodeIds.map(id => [id, null])) as any,
      connections: Object.fromEntries([...connIdsToDelete].map(id => [id, null])) as any,
      selection: undefined
    }, 'removeSelected');
  }

  private _findConnectionsUsedInNode(node: IFlowStateNode, connections: IFlowStateConnection[]): string[] {
    let result: string[] = [];
    result = result.concat(connections.filter(x => x.target === node.input).map(x => x.id));

    const outputs = node.outputs.map((x) => x.id);
    result = result.concat(connections.filter(x => outputs.includes(x.source)).map(x => x.id));

    return result;
  }

  public updateNode(nodeId: string, value: Partial<IFlowStateNode>): void {
    this._state.update({
      nodes: {
        [nodeId]: {
          ...value
        }
      }
    }, 'updateNode');
  }
}

function createTransformObject({position, scale}: FCanvasChangeEvent) {
  return {position, scale};
}

function createConnectionObject({fOutputId, fInputId}: FCreateConnectionEvent) {
  return {
    id: generateGuid(), source: fOutputId, target: fInputId!
  }
}

function createMoveNodesChangeObject(nodes: { id: string; position: IPoint; }[]) {
  return Object.fromEntries(nodes.map(({id, position}) => [id, {position}]));
}
