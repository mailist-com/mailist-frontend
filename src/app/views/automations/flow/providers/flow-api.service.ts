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
import {createSendEmailNode} from "./create-send-email-node";
import {createWaitNode} from "./create-wait-node";
import {createConditionNode} from "./create-condition-node";
import {IFlowStateConnection} from "../models/i-flow-state-connection";

@Injectable({
  providedIn: 'root'
})
export class FlowApiService {

  private readonly _state = inject(FlowState);

  public getFlowById(flowId: string): IFlowState {
    // For now, always return an empty flow. In a real application, you would load from a backend.
    return {
      nodes: {},
      connections: {},
      name: 'Nowa automatyzacja'
    }
  }

  public saveFlow(flow: IFlowState, flowId: string): void {
    // In a real application, you would save to a backend.
    console.log(`Saving flow ${flowId}:`, flow);
  }

  public resetFlow(flowId: string): void {
    // In a real application, you would reset or delete the flow on the backend.
    console.log(`Resetting flow ${flowId}`);
  }

  public transformCanvas(event: FCanvasChangeEvent): void {
    this._state.update({
      transform: createTransformObject(event)
    }, 'transformCanvas');
  }

  public createNode(event: FCreateNodeEvent): void {
    let node: IFlowStateNode | undefined;
    switch (event.data) {
      case NodeType.SendEmail:
        node = createSendEmailNode(event.rect);
        break;
      case NodeType.Wait:
        node = createWaitNode(event.rect);
        break;
      case NodeType.Condition:
        node = createConditionNode(event.rect);
        break;
      default:
        throw new Error('Unknown node type');
    }
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
