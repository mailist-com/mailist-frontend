import { ClassicPreset } from 'rete';

// Rete.js specific interfaces
export interface AutomationNode extends ClassicPreset.Node {
  data: {
    nodeType: AutomationNodeType;
    label: string;
    description?: string;
    icon: string;
    settings: { [key: string]: any };
    isComplete: boolean;
  };
}

export interface AutomationConnection extends ClassicPreset.Connection<AutomationNode, AutomationNode> {
  condition?: {
    type: 'if' | 'else';
    field: string;
    operator: string;
    value: any;
  };
  label?: string;
}

export type AutomationNodeType = 
  | 'trigger'
  | 'action' 
  | 'condition'
  | 'delay'
  | 'goal'
  | 'end';

export interface AutomationNodeTemplate {
  type: AutomationNodeType;
  subtype: string;
  name: string;
  description: string;
  icon: string;
  category: 'triggers' | 'actions' | 'logic' | 'delays' | 'goals';
  defaultSettings: { [key: string]: any };
  inputs: string[]; // Input socket keys
  outputs: string[]; // Output socket keys
}

// Database storage format
export interface ReteAutomationFlowDB {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  nodes: {
    id: string;
    name: string;
    data: any;
    position: [number, number];
  }[];
  connections: {
    id: string;
    source: string;
    target: string; 
    sourceOutput: string;
    targetInput: string;
    data?: any;
  }[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

// Node templates for Rete.js
export const RETE_NODE_TEMPLATES: AutomationNodeTemplate[] = [
  // Triggers
  {
    type: 'trigger',
    subtype: 'contact_subscribed',
    name: 'Kontakt subskrybuje',
    description: 'Uruchamia się gdy kontakt dołącza do listy',
    icon: 'lucideUserPlus',
    category: 'triggers',
    defaultSettings: { listId: '' },
    inputs: [],
    outputs: ['output']
  },
  {
    type: 'trigger',
    subtype: 'tag_added',
    name: 'Tag dodany',
    description: 'Uruchamia się gdy tag zostanie dodany',
    icon: 'lucideTag',
    category: 'triggers',
    defaultSettings: { tagName: '' },
    inputs: [],
    outputs: ['output']
  },
  {
    type: 'trigger',
    subtype: 'email_opened',
    name: 'Email otwarty',
    description: 'Uruchamia się gdy email zostanie otwarty',
    icon: 'lucideMailOpen',
    category: 'triggers',
    defaultSettings: { campaignId: '' },
    inputs: [],
    outputs: ['output']
  },
  {
    type: 'trigger',
    subtype: 'schedule',
    name: 'Harmonogram',
    description: 'Uruchamia się w określonym czasie lub cyklicznie',
    icon: 'lucideCalendar',
    category: 'triggers',
    defaultSettings: { 
      type: 'once', // once, daily, weekly, monthly
      datetime: '',
      timezone: 'Europe/Warsaw',
      daysOfWeek: [],
      dayOfMonth: 1
    },
    inputs: [],
    outputs: ['output']
  },
  {
    type: 'trigger',
    subtype: 'webhook',
    name: 'Webhook',
    description: 'Uruchamia się gdy zostanie wywołany webhook',
    icon: 'lucideWebhook',
    category: 'triggers',
    defaultSettings: { 
      url: '',
      method: 'POST',
      headers: {},
      authentication: 'none'
    },
    inputs: [],
    outputs: ['output']
  },
  {
    type: 'trigger',
    subtype: 'form_submit',
    name: 'Formularz wysłany',
    description: 'Uruchamia się gdy zostanie wysłany formularz',
    icon: 'lucideFileText',
    category: 'triggers',
    defaultSettings: { formId: '', requiredFields: [] },
    inputs: [],
    outputs: ['output']
  },
  {
    type: 'trigger',
    subtype: 'email_clicked',
    name: 'Link kliknięty',
    description: 'Uruchamia się gdy zostanie kliknięty link w emailu',
    icon: 'lucideMousePointer',
    category: 'triggers',
    defaultSettings: { 
      campaignId: '',
      linkUrl: '',
      trackAllLinks: true
    },
    inputs: [],
    outputs: ['output']
  },
  {
    type: 'trigger',
    subtype: 'api_call',
    name: 'Wywołanie API',
    description: 'Uruchamia się przez zewnętrzne wywołanie API',
    icon: 'lucideApi',
    category: 'triggers',
    defaultSettings: { 
      apiKey: '',
      allowedIPs: [],
      requireAuthentication: true
    },
    inputs: [],
    outputs: ['output']
  },

  // Actions
  {
    type: 'action',
    subtype: 'send_email',
    name: 'Wyślij email',
    description: 'Wysyła email do kontaktu',
    icon: 'lucideMail',
    category: 'actions',
    defaultSettings: { templateId: '', subject: '' },
    inputs: ['input'],
    outputs: ['output']
  },
  {
    type: 'action',
    subtype: 'add_tag',
    name: 'Dodaj tag',
    description: 'Dodaje tag do kontaktu',
    icon: 'lucideTag',
    category: 'actions',
    defaultSettings: { tagName: '' },
    inputs: ['input'],
    outputs: ['output']
  },
  {
    type: 'action',
    subtype: 'remove_tag',
    name: 'Usuń tag',
    description: 'Usuwa tag z kontaktu',
    icon: 'lucideTagX',
    category: 'actions',
    defaultSettings: { tagName: '' },
    inputs: ['input'],
    outputs: ['output']
  },
  {
    type: 'action',
    subtype: 'http_request',
    name: 'Żądanie HTTP',
    description: 'Wywołuje zewnętrzne API',
    icon: 'lucideGlobe',
    category: 'actions',
    defaultSettings: { 
      url: '',
      method: 'POST',
      headers: {},
      body: '',
      timeout: 30000,
      retries: 3
    },
    inputs: ['input'],
    outputs: ['output', 'error']
  },
  {
    type: 'action',
    subtype: 'webhook_call',
    name: 'Wywołaj webhook',
    description: 'Wysyła dane do zewnętrznego webhoka',
    icon: 'lucideWebhook',
    category: 'actions',
    defaultSettings: { 
      url: '',
      payload: '{}',
      headers: {},
      authentication: 'none'
    },
    inputs: ['input'],
    outputs: ['output', 'error']
  },
  {
    type: 'action',
    subtype: 'add_to_list',
    name: 'Dodaj do listy',
    description: 'Dodaje kontakt do listy mailingowej',
    icon: 'lucideListPlus',
    category: 'actions',
    defaultSettings: { 
      listId: '',
      subscriptionStatus: 'subscribed'
    },
    inputs: ['input'],
    outputs: ['output']
  },
  {
    type: 'action',
    subtype: 'remove_from_list',
    name: 'Usuń z listy',
    description: 'Usuwa kontakt z listy mailingowej',
    icon: 'lucideListMinus',
    category: 'actions',
    defaultSettings: { listId: '' },
    inputs: ['input'],
    outputs: ['output']
  },
  {
    type: 'action',
    subtype: 'update_contact',
    name: 'Aktualizuj kontakt',
    description: 'Aktualizuje dane kontaktu',
    icon: 'lucideUserCog',
    category: 'actions',
    defaultSettings: { 
      fields: {},
      mergeStrategy: 'update' // update, replace
    },
    inputs: ['input'],
    outputs: ['output']
  },
  {
    type: 'action',
    subtype: 'create_task',
    name: 'Utwórz zadanie',
    description: 'Tworzy zadanie do wykonania',
    icon: 'lucideCheckSquare',
    category: 'actions',
    defaultSettings: { 
      title: '',
      description: '',
      assignee: '',
      dueDate: '',
      priority: 'medium'
    },
    inputs: ['input'],
    outputs: ['output']
  },
  {
    type: 'action',
    subtype: 'send_sms',
    name: 'Wyślij SMS',
    description: 'Wysyła wiadomość SMS',
    icon: 'lucideMessageSquare',
    category: 'actions',
    defaultSettings: { 
      message: '',
      provider: 'default',
      sender: ''
    },
    inputs: ['input'],
    outputs: ['output', 'error']
  },
  {
    type: 'action',
    subtype: 'log_event',
    name: 'Zaloguj zdarzenie',
    description: 'Zapisuje zdarzenie w logach',
    icon: 'lucideFileText',
    category: 'actions',
    defaultSettings: { 
      event: '',
      data: {},
      level: 'info' // info, warning, error
    },
    inputs: ['input'],
    outputs: ['output']
  },

  // Conditions
  {
    type: 'condition',
    subtype: 'if_else',
    name: 'Warunek IF/ELSE',
    description: 'Rozgałęzienie w zależności od warunków',
    icon: 'lucideGitBranch',
    category: 'logic',
    defaultSettings: { conditions: [], operator: 'and' },
    inputs: ['input'],
    outputs: ['output-if', 'output-else']
  },
  {
    type: 'condition',
    subtype: 'tag_check',
    name: 'Sprawdź tag',
    description: 'Sprawdza czy kontakt ma określony tag',
    icon: 'lucideCheck',
    category: 'logic',
    defaultSettings: { tagName: '', hasTag: true },
    inputs: ['input'],
    outputs: ['output-if', 'output-else']
  },
  {
    type: 'condition',
    subtype: 'field_condition',
    name: 'Warunek pola',
    description: 'Sprawdza wartość pola kontaktu',
    icon: 'lucideFilter',
    category: 'logic',
    defaultSettings: { 
      field: '',
      operator: 'equals', // equals, not_equals, contains, not_contains, greater_than, less_than, is_empty, is_not_empty
      value: '',
      caseSensitive: false
    },
    inputs: ['input'],
    outputs: ['output-if', 'output-else']
  },
  {
    type: 'condition',
    subtype: 'list_membership',
    name: 'Sprawdź listę',
    description: 'Sprawdza czy kontakt należy do listy',
    icon: 'lucideUsers',
    category: 'logic',
    defaultSettings: { 
      listId: '',
      isMember: true
    },
    inputs: ['input'],
    outputs: ['output-if', 'output-else']
  },
  {
    type: 'condition',
    subtype: 'date_condition',
    name: 'Warunek daty',
    description: 'Sprawdza warunki związane z datą',
    icon: 'lucideCalendarDays',
    category: 'logic',
    defaultSettings: { 
      field: 'created_at',
      operator: 'is_after', // is_after, is_before, is_between, is_today, is_this_week, is_this_month
      value: '',
      endValue: '' // for is_between
    },
    inputs: ['input'],
    outputs: ['output-if', 'output-else']
  },
  {
    type: 'condition',
    subtype: 'engagement_score',
    name: 'Ocena zaangażowania',
    description: 'Sprawdza poziom zaangażowania kontaktu',
    icon: 'lucideTrendingUp',
    category: 'logic',
    defaultSettings: { 
      operator: 'greater_than', // greater_than, less_than, equals, between
      score: 50,
      timeframe: '30_days' // 7_days, 30_days, 90_days, all_time
    },
    inputs: ['input'],
    outputs: ['output-if', 'output-else']
  },
  {
    type: 'condition',
    subtype: 'email_behavior',
    name: 'Zachowanie email',
    description: 'Sprawdza zachowanie względem emaili',
    icon: 'lucideActivity',
    category: 'logic',
    defaultSettings: { 
      behavior: 'opened_last_email', // opened_last_email, clicked_last_email, not_opened_recent, bounced_recent
      timeframe: '7_days',
      campaignId: ''
    },
    inputs: ['input'],
    outputs: ['output-if', 'output-else']
  },
  {
    type: 'condition',
    subtype: 'advanced_condition',
    name: 'Warunek zaawansowany',
    description: 'Złożone warunki z wieloma kryteriami',
    icon: 'lucideSettings2',
    category: 'logic',
    defaultSettings: { 
      conditions: [], // array of condition objects
      operator: 'and', // and, or
      grouping: [] // for complex grouping
    },
    inputs: ['input'],
    outputs: ['output-if', 'output-else']
  },

  // Delays
  {
    type: 'delay',
    subtype: 'wait_time',
    name: 'Czekaj czas',
    description: 'Czeka określony czas',
    icon: 'lucideClock',
    category: 'delays',
    defaultSettings: { 
      amount: 1, 
      unit: 'days' // minutes, hours, days, weeks, months
    },
    inputs: ['input'],
    outputs: ['output']
  },
  {
    type: 'delay',
    subtype: 'wait_until',
    name: 'Czekaj do',
    description: 'Czeka do określonej daty/godziny',
    icon: 'lucideCalendarClock',
    category: 'delays',
    defaultSettings: { 
      datetime: '',
      timezone: 'Europe/Warsaw'
    },
    inputs: ['input'],
    outputs: ['output']
  },
  {
    type: 'delay',
    subtype: 'wait_for_day',
    name: 'Czekaj na dzień',
    description: 'Czeka do określonego dnia tygodnia',
    icon: 'lucideCalendarDays',
    category: 'delays',
    defaultSettings: { 
      dayOfWeek: 1, // 1=Monday, 7=Sunday
      time: '09:00',
      timezone: 'Europe/Warsaw'
    },
    inputs: ['input'],
    outputs: ['output']
  },
  {
    type: 'delay',
    subtype: 'wait_for_event',
    name: 'Czekaj na zdarzenie',
    description: 'Czeka na określone zdarzenie lub timeout',
    icon: 'lucideHourglass',
    category: 'delays',
    defaultSettings: { 
      event: '', // event to wait for
      timeout: 7, // timeout in days
      timeoutUnit: 'days'
    },
    inputs: ['input'],
    outputs: ['output', 'timeout']
  },

  // Goals
  {
    type: 'goal',
    subtype: 'email_click',
    name: 'Cel: Kliknięcie',
    description: 'Kończy automatyzację gdy email zostanie kliknięty',
    icon: 'lucideTarget',
    category: 'goals',
    defaultSettings: { emailId: '' },
    inputs: ['input'],
    outputs: []
  },
  {
    type: 'goal',
    subtype: 'purchase',
    name: 'Cel: Zakup',
    description: 'Kończy automatyzację gdy kontakt dokona zakupu',
    icon: 'lucideShoppingCart',
    category: 'goals',
    defaultSettings: { 
      productId: '',
      minimumAmount: 0
    },
    inputs: ['input'],
    outputs: []
  },
  {
    type: 'goal',
    subtype: 'form_submission',
    name: 'Cel: Formularz',
    description: 'Kończy automatyzację gdy zostanie wysłany formularz',
    icon: 'lucideClipboardList',
    category: 'goals',
    defaultSettings: { formId: '' },
    inputs: ['input'],
    outputs: []
  },
  {
    type: 'goal',
    subtype: 'page_visit',
    name: 'Cel: Odwiedziny',
    description: 'Kończy automatyzację gdy kontakt odwiedzi stronę',
    icon: 'lucideMousePointer2',
    category: 'goals',
    defaultSettings: { 
      url: '',
      visitDuration: 0 // minimum seconds on page
    },
    inputs: ['input'],
    outputs: []
  },
  {
    type: 'goal',
    subtype: 'tag_achieved',
    name: 'Cel: Tag osiągnięty',
    description: 'Kończy automatyzację gdy kontakt otrzyma określony tag',
    icon: 'lucideBadgeCheck',
    category: 'goals',
    defaultSettings: { tagName: '' },
    inputs: ['input'],
    outputs: []
  },

  // Additional utility nodes
  {
    type: 'action',
    subtype: 'split_test',
    name: 'Test A/B',
    description: 'Dzieli kontakty na grupy testowe',
    icon: 'lucideSplit',
    category: 'logic',
    defaultSettings: { 
      splitRatio: 50, // percentage for path A
      testName: ''
    },
    inputs: ['input'],
    outputs: ['output-a', 'output-b']
  },
  {
    type: 'action',
    subtype: 'random_delay',
    name: 'Losowe opóźnienie',
    description: 'Dodaje losowe opóźnienie w zakresie',
    icon: 'lucideDices',
    category: 'delays',
    defaultSettings: { 
      minAmount: 1,
      maxAmount: 5,
      unit: 'hours'
    },
    inputs: ['input'],
    outputs: ['output']
  },
  {
    type: 'condition',
    subtype: 'time_window',
    name: 'Okno czasowe',
    description: 'Sprawdza czy jesteśmy w określonym oknie czasowym',
    icon: 'lucideAlarmClock',
    category: 'logic',
    defaultSettings: { 
      startTime: '09:00',
      endTime: '17:00',
      timezone: 'Europe/Warsaw',
      daysOfWeek: [1,2,3,4,5] // Monday to Friday
    },
    inputs: ['input'],
    outputs: ['output-if', 'output-else']
  },

  // End
  {
    type: 'end',
    subtype: 'end',
    name: 'Koniec',
    description: 'Kończy automatyzację',
    icon: 'lucideSquare',
    category: 'logic',
    defaultSettings: {},
    inputs: ['input'],
    outputs: []
  }
];