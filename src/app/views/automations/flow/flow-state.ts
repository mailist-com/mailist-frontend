import { Injectable, signal, WritableSignal } from "@angular/core";
import { IFlowState } from "./models/i-flow-state";
import { IFlowStateNode } from "./models/i-flow-state-node";
import { IFlowStateConnection } from "./models/i-flow-state-connection";
import { IPoint } from "@foblex/2d";

function deepCopy<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  return JSON.parse(JSON.stringify(obj));
}

interface IFlowStateUpdatePatch {
  nodes?: { [key: string]: Partial<IFlowStateNode> };
  connections?: { [key: string]: Partial<IFlowStateConnection> };
  transform?: Partial<{ scale: number; position: IPoint; }>;
  selection?: Partial<{ nodes: string[]; connections: string[]; groups: string[]; }> | undefined;
}

@Injectable({
  providedIn: 'root'
})
export class FlowState {

  private history: WritableSignal<IFlowState[]> = signal([]);
  private currentIndex = signal(-1);

  public changes = signal(0);

  public initialize(initialState: IFlowState): void {
    this.history.set([deepCopy(initialState)]);
    this.currentIndex.set(0);
    this.changes.set(1);
  }

  private updateState(newState: IFlowState): void {
    const currentHistory = this.history().slice(0, this.currentIndex() + 1);
    this.history.set([...currentHistory, newState]);
    this.currentIndex.update(i => i + 1);
    this.changes.update(c => c + 1);
  }

  public getSnapshot(): IFlowState {
    if (this.currentIndex() === -1) {
        return { nodes: {}, connections: {} };
    }
    return this.history()[this.currentIndex()];
  }

  public canUndo(): boolean {
    return this.currentIndex() > 0;
  }

  public undo(): void {
    if (this.canUndo()) {
      this.currentIndex.update(i => i - 1);
      this.changes.update(c => c + 1);
    }
  }

  public canRedo(): boolean {
    return this.currentIndex() < this.history().length - 1;
  }

  public redo(): void {
    if (this.canRedo()) {
      this.currentIndex.update(i => i + 1);
      this.changes.update(c => c + 1);
    }
  }

  public create(patch: Partial<IFlowState>, actionName?: string): void {
    const currentState = this.getSnapshot();
    const newState = deepCopy(currentState);
    if (patch.nodes) {
        Object.assign(newState.nodes, patch.nodes);
    }
    if (patch.connections) {
        Object.assign(newState.connections, patch.connections);
    }
    if (patch.selection) {
        newState.selection = patch.selection;
    }
    this.updateState(newState);
  }

  public update(patch: IFlowStateUpdatePatch, actionName?: string): void {
    const currentState = this.getSnapshot();
    const newState = deepCopy(currentState);

    if (patch.nodes) {
        for (const key in patch.nodes) {
            if (newState.nodes[key]) {
                Object.assign(newState.nodes[key], patch.nodes[key]);
            }
        }
    }
    if (patch.connections) {
        for (const key in patch.connections) {
            if (newState.connections[key]) {
                Object.assign(newState.connections[key], patch.connections[key]);
            }
        }
    }
    if (patch.transform) {
        if (!newState.transform) {
            newState.transform = { scale: 1, position: { x: 0, y: 0 } }; // Default values
        }
        newState.transform = { ...newState.transform, ...patch.transform };
    }
    if (patch.hasOwnProperty('selection')) {
        newState.selection = patch.selection as any;
    }

    this.updateState(newState);
  }

  public delete(patch: Partial<IFlowState>, actionName?: string): void {
    const currentState = this.getSnapshot();
    const newState = deepCopy(currentState);
    if (patch.nodes) {
        for (const key in patch.nodes) {
            delete newState.nodes[key];
        }
    }
    if (patch.connections) {
        for (const key in patch.connections) {
            delete newState.connections[key];
        }
    }
    if (patch.hasOwnProperty('selection')) {
        newState.selection = undefined;
    }
    this.updateState(newState);
  }

  public patchBase(patch: Partial<IFlowState>): void {
    const currentState = this.getSnapshot();
    const newState = deepCopy(currentState);
    if (patch.transform) {
        if (!newState.transform) {
            newState.transform = { scale: 1, position: { x: 0, y: 0 } }; // Default values
        }
        newState.transform = { ...newState.transform, ...patch.transform };
    }
    // Handle other top-level properties if needed, e.g., nodes, connections, selection
    // For now, assuming patchBase is primarily for initial transform or full state replacement
    const newHistory = [deepCopy(newState)];
    this.history.set(newHistory);
    this.currentIndex.set(0);
    this.changes.update(c => c + 1);
  }
}
