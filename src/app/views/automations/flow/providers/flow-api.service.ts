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
import {Observable, of, map, catchError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FlowApiService {

  private readonly _state = inject(FlowState);
  private readonly _automationService = inject(AutomationService);

  private _currentAutomationId: string | null = null;

  /**
   * Load flow state from backend (async)
   */
  public loadFlowFromBackend(flowId: string): Observable<IFlowState> {
    this._currentAutomationId = flowId;
    console.log('[FlowApiService] Loading flow from backend for ID:', flowId);

    // For new automations (no flowId or temporary ID), return empty flow
    if (!flowId || flowId.includes('temp-')) {
      console.log('[FlowApiService] New automation - returning empty flow');
      return of({
        nodes: {},
        connections: {},
        name: 'Nowa automatyzacja'
      });
    }

    // Load automation from backend
    return this._automationService.getAutomationById(flowId).pipe(
      map(automation => {
        if (!automation) {
          console.warn('[FlowApiService] Automation not found:', flowId);
          return {
            nodes: {},
            connections: {},
            name: 'Nowa automatyzacja'
          };
        }

        console.log('[FlowApiService] Loaded automation from backend:', {
          id: automation.id,
          name: automation.name,
          hasFlowData: !!automation.flowData
        });

        // If automation has flowData, use it
        if (automation.flowData) {
          const flowState = automation.flowData as IFlowState;
          console.log('[FlowApiService] Using flowData:', {
            nodeCount: Object.keys(flowState.nodes || {}).length,
            connectionCount: Object.keys(flowState.connections || {}).length
          });
          return flowState;
        }

        // Otherwise return empty flow with automation name
        console.log('[FlowApiService] No flowData, returning empty flow');
        return {
          nodes: {},
          connections: {},
          name: automation.name || 'Automatyzacja'
        };
      }),
      catchError(error => {
        console.error('[FlowApiService] Error loading automation:', error);
        return of({
          nodes: {},
          connections: {},
          name: 'Nowa automatyzacja'
        });
      })
    );
  }

  /**
   * @deprecated Use loadFlowFromBackend instead
   */
  public getFlowById(flowId: string): IFlowState {
    this._currentAutomationId = flowId;
    console.log('[FlowApiService] getFlowById (deprecated) - returning empty state');

    return {
      nodes: {},
      connections: {},
      name: 'Ładowanie...'
    };
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
