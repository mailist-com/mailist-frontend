import { NodeType } from '../enums/node-type';

export const NODE_PARAMS_MAP = {
  // Triggers
  [NodeType.SubscriberJoinsGroup]: {
    name: 'Subskrybent dołącza do grupy',
    icon: 'lucideUserPlus',
    color: '#8b5cf6',
    category: 'Wyzwalacze',
  },
  [NodeType.TagAdded]: {
    name: 'Tag dodany',
    icon: 'lucideTag',
    color: '#8b5cf6',
    category: 'Wyzwalacze',
  },
  [NodeType.TagRemoved]: {
    name: 'Tag usunięty',
    icon: 'lucideX',
    color: '#8b5cf6',
    category: 'Wyzwalacze',
  },
  [NodeType.EmailOpened]: {
    name: 'Email otwarty',
    icon: 'lucideMailOpen',
    color: '#8b5cf6',
    category: 'Wyzwalacze',
  },
  [NodeType.Unsubscribed]: {
    name: 'Wypisanie z listy',
    icon: 'lucideUserMinus',
    color: '#8b5cf6',
    category: 'Wyzwalacze',
  },

  // Actions
  [NodeType.SendEmail]: {
    name: 'Wyślij email',
    icon: 'lucideMail',
    color: '#10b981',
    category: 'Akcje',
  },
  [NodeType.Wait]: {
    name: 'Czekaj',
    icon: 'lucideClock',
    color: '#f59e0b',
    category: 'Akcje',
  },
  [NodeType.AddToGroup]: {
    name: 'Dodaj do grupy',
    icon: 'lucideUserPlus',
    color: '#10b981',
    category: 'Akcje',
  },
  [NodeType.RemoveFromGroup]: {
    name: 'Usuń z grupy',
    icon: 'lucideUserMinus',
    color: '#10b981',
    category: 'Akcje',
  },
  [NodeType.AddTag]: {
    name: 'Dodaj tag',
    icon: 'lucideTag',
    color: '#10b981',
    category: 'Akcje',
  },
  [NodeType.RemoveTag]: {
    name: 'Usuń tag',
    icon: 'lucideX',
    color: '#10b981',
    category: 'Akcje',
  },

  // Conditions
  [NodeType.Condition]: {
    name: 'Warunek',
    icon: 'lucideGitBranch',
    color: '#3b82f6',
    category: 'Warunki',
  },
};
