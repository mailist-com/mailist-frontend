import { IPoint } from '@foblex/2d';
import { NodeType } from '../enums/node-type';

export interface INodeOutput {
  id: string;
  name: string;
}

export interface IFlowStateNode {
  id: string;
  type: NodeType;
  position: IPoint;
  input?: string;
  outputs: INodeOutput[];
  data?: any;
  isExpanded?: boolean;
  description?: string;
  value?: any;
}

// export {IFlowStateNode}
