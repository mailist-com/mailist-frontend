import { IPoint } from '@foblex/2d';
import { generateGuid } from '@foblex/utils';
import { IFlowStateNode } from '../models/i-flow-state-node';
import { NodeType } from '../enums/node-type';
import { NODE_PARAMS_MAP } from '../constants/node-params-map';

export function createGenericNode(nodeType: NodeType, position: IPoint): IFlowStateNode {
  const id = generateGuid();
  const inputId = generateGuid();
  const outputId = generateGuid();

  const nodeParams = NODE_PARAMS_MAP[nodeType];
  const hasInput = !isTriggerNode(nodeType); // Triggers don't have inputs
  const hasMultipleOutputs = isConditionalNode(nodeType);

  const outputs = hasMultipleOutputs
    ? [
        { id: generateGuid(), name: 'Tak' },
        { id: generateGuid(), name: 'Nie' }
      ]
    : [{ id: outputId, name: 'Dalej' }];

  return {
    id,
    type: nodeType,
    position,
    input: hasInput ? inputId : undefined,
    outputs,
    data: {
      title: nodeParams?.name || 'Node',
    },
  };
}

function isTriggerNode(nodeType: NodeType): boolean {
  return [
    NodeType.SubscriberJoinsGroup,
    NodeType.TagAdded,
    NodeType.TagRemoved,
    NodeType.EmailOpened,
    NodeType.Unsubscribed,
  ].includes(nodeType);
}

function isConditionalNode(nodeType: NodeType): boolean {
  return [
    NodeType.Condition,
  ].includes(nodeType);
}
