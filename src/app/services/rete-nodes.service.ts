import { Injectable } from '@angular/core';
import { ClassicPreset } from 'rete';
import { AutomationNodeTemplate, AutomationNodeType, AutomationNode } from '../models/rete-automation-flow.model';

export class AutomationNodeBase extends ClassicPreset.Node implements AutomationNode {
  data: {
    nodeType: AutomationNodeType;
    label: string;
    description?: string;
    icon: string;
    settings: { [key: string]: any };
    isComplete: boolean;
  };

  constructor(
    name: string, 
    public nodeType: AutomationNodeType,
    public template: AutomationNodeTemplate
  ) {
    super(name);
    this.data = {
      nodeType: nodeType,
      label: template.name,
      description: template.description,
      icon: template.icon,
      settings: { ...template.defaultSettings },
      isComplete: false
    };
  }

  // Helper method to setup sockets based on template
  setupSockets(): this {
    // Add inputs
    this.template.inputs.forEach(inputKey => {
      this.addInput(inputKey, new ClassicPreset.Input(new ClassicPreset.Socket(inputKey), inputKey, false));
    });

    // Add outputs
    this.template.outputs.forEach(outputKey => {
      this.addOutput(outputKey, new ClassicPreset.Output(new ClassicPreset.Socket(outputKey), outputKey, false));
    });

    return this;
  }

  // Method to validate node completion
  isNodeComplete(): boolean {
    const settings = this.data.settings;
    
    switch (this.nodeType) {
      case 'trigger':
        if (this.template.subtype === 'tag_added' && !settings['tagName']) return false;
        if (this.template.subtype === 'contact_subscribed' && !settings['listId']) return false;
        if (this.template.subtype === 'email_opened' && !settings['campaignId']) return false;
        if (this.template.subtype === 'email_clicked' && !settings['campaignId']) return false;
        if (this.template.subtype === 'schedule' && !settings['datetime'] && settings['type'] === 'once') return false;
        if (this.template.subtype === 'webhook' && !settings['url']) return false;
        if (this.template.subtype === 'form_submit' && !settings['formId']) return false;
        if (this.template.subtype === 'api_call' && !settings['apiKey']) return false;
        break;
      
      case 'action':
        if (this.template.subtype === 'send_email' && !settings['templateId']) return false;
        if ((this.template.subtype === 'add_tag' || this.template.subtype === 'remove_tag') && !settings['tagName']) return false;
        if (this.template.subtype === 'http_request' && !settings['url']) return false;
        if (this.template.subtype === 'webhook_call' && !settings['url']) return false;
        if (this.template.subtype === 'add_to_list' && !settings['listId']) return false;
        if (this.template.subtype === 'remove_from_list' && !settings['listId']) return false;
        if (this.template.subtype === 'update_contact' && (!settings['fields'] || Object.keys(settings['fields']).length === 0)) return false;
        if (this.template.subtype === 'create_task' && !settings['title']) return false;
        if (this.template.subtype === 'send_sms' && !settings['message']) return false;
        if (this.template.subtype === 'log_event' && !settings['event']) return false;
        if (this.template.subtype === 'split_test' && !settings['testName']) return false;
        break;
      
      case 'condition':
        if (this.template.subtype === 'tag_check' && !settings['tagName']) return false;
        if (this.template.subtype === 'if_else' && (!settings['conditions'] || settings['conditions'].length === 0)) return false;
        if (this.template.subtype === 'field_condition' && (!settings['field'] || !settings['operator'])) return false;
        if (this.template.subtype === 'list_membership' && !settings['listId']) return false;
        if (this.template.subtype === 'date_condition' && (!settings['field'] || !settings['operator'])) return false;
        if (this.template.subtype === 'engagement_score' && !settings['operator']) return false;
        if (this.template.subtype === 'email_behavior' && !settings['behavior']) return false;
        if (this.template.subtype === 'advanced_condition' && (!settings['conditions'] || settings['conditions'].length === 0)) return false;
        if (this.template.subtype === 'time_window' && (!settings['startTime'] || !settings['endTime'])) return false;
        break;
      
      case 'delay':
        if (this.template.subtype === 'wait_time' && (!settings['amount'] || settings['amount'] < 1)) return false;
        if (this.template.subtype === 'wait_until' && !settings['datetime']) return false;
        if (this.template.subtype === 'wait_for_day' && (!settings['dayOfWeek'] || !settings['time'])) return false;
        if (this.template.subtype === 'wait_for_event' && !settings['event']) return false;
        if (this.template.subtype === 'random_delay' && (!settings['minAmount'] || !settings['maxAmount'])) return false;
        break;
      
      case 'goal':
        if (this.template.subtype === 'email_click' && !settings['emailId']) return false;
        if (this.template.subtype === 'purchase' && !settings['productId']) return false;
        if (this.template.subtype === 'form_submission' && !settings['formId']) return false;
        if (this.template.subtype === 'page_visit' && !settings['url']) return false;
        if (this.template.subtype === 'tag_achieved' && !settings['tagName']) return false;
        break;
    }
    
    return true;
  }

  // Update settings and recalculate completion
  updateSettings(newSettings: any): void {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.data.isComplete = this.isNodeComplete();
  }
}

// Specific node classes
export class TriggerNode extends AutomationNodeBase {
  constructor(template: AutomationNodeTemplate) {
    super(`Trigger-${template.subtype}`, 'trigger', template);
    this.setupSockets();
  }
}

export class ActionNode extends AutomationNodeBase {
  constructor(template: AutomationNodeTemplate) {
    super(`Action-${template.subtype}`, 'action', template);
    this.setupSockets();
  }
}

export class ConditionNode extends AutomationNodeBase {
  constructor(template: AutomationNodeTemplate) {
    super(`Condition-${template.subtype}`, 'condition', template);
    this.setupSockets();
  }
}

export class DelayNode extends AutomationNodeBase {
  constructor(template: AutomationNodeTemplate) {
    super(`Delay-${template.subtype}`, 'delay', template);
    this.setupSockets();
  }
}

export class GoalNode extends AutomationNodeBase {
  constructor(template: AutomationNodeTemplate) {
    super(`Goal-${template.subtype}`, 'goal', template);
    this.setupSockets();
  }
}

export class EndNode extends AutomationNodeBase {
  constructor(template: AutomationNodeTemplate) {
    super(`End-${template.subtype}`, 'end', template);
    this.setupSockets();
  }
}

@Injectable({
  providedIn: 'root'
})
export class ReteNodesService {
  
  createNode(template: AutomationNodeTemplate, id?: string): AutomationNodeBase {
    let node: AutomationNodeBase;
    
    switch (template.type) {
      case 'trigger':
        node = new TriggerNode(template);
        break;
      case 'action':
        node = new ActionNode(template);
        break;
      case 'condition':
        node = new ConditionNode(template);
        break;
      case 'delay':
        node = new DelayNode(template);
        break;
      case 'goal':
        node = new GoalNode(template);
        break;
      case 'end':
        node = new EndNode(template);
        break;
      default:
        throw new Error(`Unknown node type: ${template.type}`);
    }
    
    // Set custom ID if provided
    if (id) {
      node.id = id;
    }
    
    return node;
  }
  
  // Helper to get output socket label for conditions
  getOutputLabel(nodeType: AutomationNodeType, outputKey: string, nodeSubtype?: string): string {
    if (nodeType === 'condition') {
      switch (outputKey) {
        case 'output-if': return 'TAK';
        case 'output-else': return 'NIE';
        default: return 'Wyjście';
      }
    }
    
    if (nodeType === 'action' && nodeSubtype === 'split_test') {
      switch (outputKey) {
        case 'output-a': return 'Grupa A';
        case 'output-b': return 'Grupa B';
        default: return 'Wyjście';
      }
    }
    
    if (nodeType === 'delay' && nodeSubtype === 'wait_for_event') {
      switch (outputKey) {
        case 'output': return 'Zdarzenie';
        case 'timeout': return 'Timeout';
        default: return 'Wyjście';
      }
    }
    
    if (nodeType === 'action' && (nodeSubtype === 'http_request' || nodeSubtype === 'webhook_call' || nodeSubtype === 'send_sms')) {
      switch (outputKey) {
        case 'output': return 'Sukces';
        case 'error': return 'Błąd';
        default: return 'Wyjście';
      }
    }
    
    return 'Wyjście';
  }
  
  // Helper to get input socket label
  getInputLabel(inputKey: string): string {
    return 'Wejście';
  }
}