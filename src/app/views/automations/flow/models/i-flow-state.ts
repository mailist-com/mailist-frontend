import { IPoint } from '@foblex/2d';
import type { IFlowStateNode } from './i-flow-state-node';
import type { IFlowStateConnection } from './i-flow-state-connection';

export interface IFlowState {
  name?: string;
  nodes: { [key: string]: IFlowStateNode };
  connections: { [key: string]: IFlowStateConnection };
  transform?: {
    scale: number;
    position: IPoint;
  };
  selection?: {
    nodes: string[];
    connections: string[];
    groups?: string[];
  };
}

export type { IFlowStateNode, IFlowStateConnection };
