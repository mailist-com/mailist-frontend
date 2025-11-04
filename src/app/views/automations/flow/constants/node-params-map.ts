import { NodeType } from '../enums/node-type';

export const NODE_PARAMS_MAP = {
  [NodeType.SendEmail]: {
    name: 'Send Email',
    icon: 'lucideMail',
    color: '#4caf50',
    category: 'Akcje',
  },
  [NodeType.Wait]: {
    name: 'Wait',
    icon: 'lucideClock',
    color: '#ff9800',
    category: 'Akcje',
  },
  [NodeType.Condition]: {
    name: 'Condition',
    icon: 'lucideHelpCircle',
    color: '#2196f3',
    category: 'Logika',
  },
};
