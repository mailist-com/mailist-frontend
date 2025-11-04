import { IPoint } from '@foblex/2d';
import { generateGuid } from '@foblex/utils';
import { IFlowStateNode } from '../models/i-flow-state-node';
import { NodeType } from '../enums/node-type';

export function createConditionNode(position: IPoint): IFlowStateNode {
  const id = generateGuid();
  const inputId = generateGuid();
  const outputId1 = generateGuid();
  const outputId2 = generateGuid();

  return {
    id,
    type: NodeType.Condition,
    position,
    input: inputId,
    outputs: [ { id: outputId1, name: 'True' }, { id: outputId2, name: 'False' } ],
    data: { title: 'Condition' },
  };
}
