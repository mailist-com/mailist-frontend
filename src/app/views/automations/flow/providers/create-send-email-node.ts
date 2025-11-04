import { IPoint, IRect } from '@foblex/2d';
import { generateGuid } from '@foblex/utils';
import { IFlowStateNode } from '../models/i-flow-state-node';
import { NodeType } from '../enums/node-type';

export function createSendEmailNode(position: IPoint): IFlowStateNode {
  const id = generateGuid();
  const inputId = generateGuid();
  const outputId = generateGuid();

  return {
    id,
    type: NodeType.SendEmail,
    position,
    input: inputId,
    outputs: [ { id: outputId, name: 'Next' } ],
    data: { title: 'Send Email' },
  };
}
