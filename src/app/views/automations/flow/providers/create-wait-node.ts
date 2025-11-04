import { IPoint } from '@foblex/2d';
import { generateGuid } from '@foblex/utils';
import { IFlowStateNode } from '../models/i-flow-state-node';
import { NodeType } from '../enums/node-type';

export function createWaitNode(position: IPoint): IFlowStateNode {
  const id = generateGuid();
  const inputId = generateGuid();
  const outputId = generateGuid();

  return {
    id,
    type: NodeType.Wait,
    position,
    input: inputId,
    outputs: [ { id: outputId, name: 'Next' } ],
    data: { title: 'Wait' },
  };
}
