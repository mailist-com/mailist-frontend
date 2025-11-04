import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, timer, of, throwError } from 'rxjs';
import { map, switchMap, delay, catchError } from 'rxjs/operators';
import { 
  ReteAutomationFlowDB, 
  AutomationNodeType,
  RETE_NODE_TEMPLATES 
} from '../models/rete-automation-flow.model';

export interface WorkflowContext {
  contactId: string;
  contact: any;
  variables: { [key: string]: any };
  executionId: string;
  startedAt: Date;
  currentNodeId?: string;
}

export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  nextNodeIds?: string[];
}

export interface WorkflowEvent {
  type: 'started' | 'node_executed' | 'completed' | 'failed' | 'paused';
  executionId: string;
  nodeId?: string;
  data?: any;
  error?: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowExecutionService {
  private activeExecutions = new Map<string, WorkflowContext>();
  private eventSubject = new Subject<WorkflowEvent>();
  
  public events$ = this.eventSubject.asObservable();

  constructor() {}

  // Start workflow execution
  executeWorkflow(
    workflow: ReteAutomationFlowDB, 
    contact: any, 
    triggerData?: any
  ): Observable<string> {
    const executionId = this.generateExecutionId();
    const context: WorkflowContext = {
      contactId: contact.id,
      contact: contact,
      variables: { ...triggerData },
      executionId,
      startedAt: new Date()
    };

    this.activeExecutions.set(executionId, context);
    
    this.emitEvent({
      type: 'started',
      executionId,
      timestamp: new Date(),
      data: { workflow: workflow.name, contact: contact.email }
    });

    // Find trigger node
    const triggerNode = workflow.nodes.find(node => {
      const template = RETE_NODE_TEMPLATES.find(t => t.name === node.name);
      return template?.type === 'trigger';
    });

    if (!triggerNode) {
      this.emitEvent({
        type: 'failed',
        executionId,
        error: 'No trigger node found',
        timestamp: new Date()
      });
      return throwError('No trigger node found');
    }

    // Start execution from trigger
    this.executeNodeChain(workflow, triggerNode.id, context);
    
    return of(executionId);
  }

  // Execute a chain of nodes starting from a specific node
  private async executeNodeChain(
    workflow: ReteAutomationFlowDB,
    startNodeId: string,
    context: WorkflowContext
  ): Promise<void> {
    let currentNodeId = startNodeId;
    
    while (currentNodeId && this.activeExecutions.has(context.executionId)) {
      context.currentNodeId = currentNodeId;
      
      try {
        const result = await this.executeNode(workflow, currentNodeId, context);
        
        this.emitEvent({
          type: 'node_executed',
          executionId: context.executionId,
          nodeId: currentNodeId,
          data: result.data,
          timestamp: new Date()
        });

        if (!result.success) {
          this.emitEvent({
            type: 'failed',
            executionId: context.executionId,
            nodeId: currentNodeId,
            error: result.error,
            timestamp: new Date()
          });
          break;
        }

        // Get next nodes
        const nextNodeIds = result.nextNodeIds || this.getNextNodeIds(workflow, currentNodeId);
        
        if (nextNodeIds.length === 0) {
          // Workflow completed
          this.emitEvent({
            type: 'completed',
            executionId: context.executionId,
            timestamp: new Date()
          });
          this.activeExecutions.delete(context.executionId);
          break;
        } else if (nextNodeIds.length === 1) {
          // Continue to next node
          currentNodeId = nextNodeIds[0];
        } else {
          // Multiple paths - execute all in parallel
          for (const nodeId of nextNodeIds) {
            this.executeNodeChain(workflow, nodeId, { ...context });
          }
          break;
        }
        
      } catch (error) {
        this.emitEvent({
          type: 'failed',
          executionId: context.executionId,
          nodeId: currentNodeId,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        });
        break;
      }
    }
  }

  // Execute a single node
  private async executeNode(
    workflow: ReteAutomationFlowDB,
    nodeId: string,
    context: WorkflowContext
  ): Promise<ExecutionResult> {
    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) {
      return { success: false, error: `Node ${nodeId} not found` };
    }

    const template = RETE_NODE_TEMPLATES.find(t => t.name === node.name);
    if (!template) {
      return { success: false, error: `Template for node ${node.name} not found` };
    }

    // Execute based on node type
    switch (template.type) {
      case 'trigger':
        return this.executeTriggerNode(template, node, context);
      
      case 'action':
        return this.executeActionNode(template, node, context);
      
      case 'condition':
        return this.executeConditionNode(template, node, context);
      
      case 'delay':
        return this.executeDelayNode(template, node, context);
      
      case 'goal':
        return this.executeGoalNode(template, node, context);
      
      case 'end':
        return { success: true, nextNodeIds: [] };
      
      default:
        return { success: false, error: `Unknown node type: ${template.type}` };
    }
  }

  // Execute trigger node
  private async executeTriggerNode(template: any, node: any, context: WorkflowContext): Promise<ExecutionResult> {
    // Triggers are already fired, just pass through
    return { success: true };
  }

  // Execute action node
  private async executeActionNode(template: any, node: any, context: WorkflowContext): Promise<ExecutionResult> {
    const settings = node.data.settings || template.defaultSettings;
    
    switch (template.subtype) {
      case 'send_email':
        return this.sendEmail(settings, context);
      
      case 'add_tag':
        return this.addTag(settings, context);
      
      case 'remove_tag':
        return this.removeTag(settings, context);
      
      case 'http_request':
        return this.makeHttpRequest(settings, context);
      
      case 'webhook_call':
        return this.callWebhook(settings, context);
      
      case 'add_to_list':
        return this.addToList(settings, context);
      
      case 'remove_from_list':
        return this.removeFromList(settings, context);
      
      case 'update_contact':
        return this.updateContact(settings, context);
      
      case 'create_task':
        return this.createTask(settings, context);
      
      case 'send_sms':
        return this.sendSms(settings, context);
      
      case 'log_event':
        return this.logEvent(settings, context);
      
      case 'split_test':
        return this.splitTest(settings, context);
      
      default:
        return { success: false, error: `Unknown action: ${template.subtype}` };
    }
  }

  // Execute condition node
  private async executeConditionNode(template: any, node: any, context: WorkflowContext): Promise<ExecutionResult> {
    const settings = node.data.settings || template.defaultSettings;
    let conditionMet = false;
    
    switch (template.subtype) {
      case 'if_else':
        conditionMet = this.evaluateConditions(settings.conditions, settings.operator, context);
        break;
      
      case 'tag_check':
        conditionMet = this.hasTag(settings.tagName, context);
        break;
      
      case 'field_condition':
        conditionMet = this.evaluateFieldCondition(settings, context);
        break;
      
      case 'list_membership':
        conditionMet = this.isInList(settings.listId, context);
        break;
      
      case 'date_condition':
        conditionMet = this.evaluateDateCondition(settings, context);
        break;
      
      case 'engagement_score':
        conditionMet = this.evaluateEngagementScore(settings, context);
        break;
      
      case 'email_behavior':
        conditionMet = this.evaluateEmailBehavior(settings, context);
        break;
      
      case 'time_window':
        conditionMet = this.isInTimeWindow(settings, context);
        break;
      
      default:
        return { success: false, error: `Unknown condition: ${template.subtype}` };
    }
    
    // Return appropriate output path
    const outputPath = conditionMet ? 'output-if' : 'output-else';
    return { success: true, data: { conditionMet, outputPath } };
  }

  // Execute delay node
  private async executeDelayNode(template: any, node: any, context: WorkflowContext): Promise<ExecutionResult> {
    const settings = node.data.settings || template.defaultSettings;
    
    switch (template.subtype) {
      case 'wait_time':
        return this.waitTime(settings, context);
      
      case 'wait_until':
        return this.waitUntil(settings, context);
      
      case 'wait_for_day':
        return this.waitForDay(settings, context);
      
      case 'wait_for_event':
        return this.waitForEvent(settings, context);
      
      case 'random_delay':
        return this.randomDelay(settings, context);
      
      default:
        return { success: false, error: `Unknown delay: ${template.subtype}` };
    }
  }

  // Execute goal node
  private async executeGoalNode(template: any, node: any, context: WorkflowContext): Promise<ExecutionResult> {
    // Goals end the workflow
    const settings = node.data.settings || template.defaultSettings;
    
    // Log goal achievement
    console.log(`Goal achieved: ${template.subtype}`, settings);
    
    return { success: true, nextNodeIds: [] };
  }

  // Action implementations
  private async sendEmail(settings: any, context: WorkflowContext): Promise<ExecutionResult> {
    // Simulate sending email
    console.log('Sending email:', settings, 'to contact:', context.contact.email);
    
    // In real implementation, call email service API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { 
      success: true, 
      data: { 
        emailSent: true, 
        recipient: context.contact.email,
        template: settings.templateId 
      } 
    };
  }

  private async addTag(settings: any, context: WorkflowContext): Promise<ExecutionResult> {
    console.log('Adding tag:', settings.tagName, 'to contact:', context.contact.email);
    
    // Update context
    if (!context.contact.tags) context.contact.tags = [];
    if (!context.contact.tags.includes(settings.tagName)) {
      context.contact.tags.push(settings.tagName);
    }
    
    return { success: true, data: { tagAdded: settings.tagName } };
  }

  private async removeTag(settings: any, context: WorkflowContext): Promise<ExecutionResult> {
    console.log('Removing tag:', settings.tagName, 'from contact:', context.contact.email);
    
    if (context.contact.tags) {
      const index = context.contact.tags.indexOf(settings.tagName);
      if (index > -1) {
        context.contact.tags.splice(index, 1);
      }
    }
    
    return { success: true, data: { tagRemoved: settings.tagName } };
  }

  private async makeHttpRequest(settings: any, context: WorkflowContext): Promise<ExecutionResult> {
    console.log('Making HTTP request:', settings.url);
    
    try {
      // Simulate HTTP request
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return { 
        success: true, 
        data: { 
          response: { status: 200, data: 'Mock response' },
          url: settings.url 
        } 
      };
    } catch (error) {
      return { 
        success: false, 
        error: `HTTP request failed: ${error}`,
        nextNodeIds: [] // Route to error output
      };
    }
  }

  private async callWebhook(settings: any, context: WorkflowContext): Promise<ExecutionResult> {
    console.log('Calling webhook:', settings.url);
    
    try {
      // Simulate webhook call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return { 
        success: true, 
        data: { 
          webhookCalled: true,
          url: settings.url,
          payload: settings.payload 
        } 
      };
    } catch (error) {
      return { 
        success: false, 
        error: `Webhook call failed: ${error}` 
      };
    }
  }

  private async splitTest(settings: any, context: WorkflowContext): Promise<ExecutionResult> {
    const random = Math.random() * 100;
    const usePathA = random < settings.splitRatio;
    
    console.log(`Split test: ${settings.testName}, using path ${usePathA ? 'A' : 'B'}`);
    
    return { 
      success: true, 
      data: { 
        pathTaken: usePathA ? 'A' : 'B',
        testName: settings.testName 
      },
      nextNodeIds: [] // Will be handled by path selection
    };
  }

  // Condition implementations
  private evaluateConditions(conditions: any[], operator: string, context: WorkflowContext): boolean {
    if (!conditions || conditions.length === 0) return false;
    
    const results = conditions.map(condition => {
      // Implement condition evaluation logic
      return true; // Simplified
    });
    
    return operator === 'and' ? results.every(r => r) : results.some(r => r);
  }

  private hasTag(tagName: string, context: WorkflowContext): boolean {
    return context.contact.tags?.includes(tagName) || false;
  }

  private evaluateFieldCondition(settings: any, context: WorkflowContext): boolean {
    const fieldValue = context.contact[settings.field];
    const compareValue = settings.value;
    
    switch (settings.operator) {
      case 'equals': return fieldValue === compareValue;
      case 'not_equals': return fieldValue !== compareValue;
      case 'contains': return String(fieldValue).includes(String(compareValue));
      case 'not_contains': return !String(fieldValue).includes(String(compareValue));
      case 'greater_than': return Number(fieldValue) > Number(compareValue);
      case 'less_than': return Number(fieldValue) < Number(compareValue);
      case 'is_empty': return !fieldValue || fieldValue === '';
      case 'is_not_empty': return fieldValue && fieldValue !== '';
      default: return false;
    }
  }

  private isInTimeWindow(settings: any, context: WorkflowContext): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const currentDay = now.getDay() || 7; // Convert Sunday (0) to 7
    
    const startTime = this.parseTime(settings.startTime);
    const endTime = this.parseTime(settings.endTime);
    
    const isInTimeRange = currentTime >= startTime && currentTime <= endTime;
    const isInDayRange = settings.daysOfWeek.includes(currentDay);
    
    return isInTimeRange && isInDayRange;
  }

  // Delay implementations
  private async waitTime(settings: any, context: WorkflowContext): Promise<ExecutionResult> {
    const milliseconds = this.convertToMilliseconds(settings.amount, settings.unit);
    
    console.log(`Waiting ${settings.amount} ${settings.unit}...`);
    
    // In real implementation, this would schedule for later execution
    await new Promise(resolve => setTimeout(resolve, Math.min(milliseconds, 5000))); // Cap at 5s for demo
    
    return { success: true, data: { waited: `${settings.amount} ${settings.unit}` } };
  }

  private async randomDelay(settings: any, context: WorkflowContext): Promise<ExecutionResult> {
    const randomAmount = Math.random() * (settings.maxAmount - settings.minAmount) + settings.minAmount;
    const milliseconds = this.convertToMilliseconds(randomAmount, settings.unit);
    
    console.log(`Random delay: ${randomAmount.toFixed(2)} ${settings.unit}...`);
    
    await new Promise(resolve => setTimeout(resolve, Math.min(milliseconds, 5000))); // Cap at 5s for demo
    
    return { success: true, data: { waited: `${randomAmount.toFixed(2)} ${settings.unit}` } };
  }

  // Utility methods
  private getNextNodeIds(workflow: ReteAutomationFlowDB, currentNodeId: string): string[] {
    const connections = workflow.connections.filter(conn => conn.source === currentNodeId);
    return connections.map(conn => conn.target);
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 100 + minutes;
  }

  private convertToMilliseconds(amount: number, unit: string): number {
    const multipliers: { [key: string]: number } = {
      'minutes': 60 * 1000,
      'hours': 60 * 60 * 1000,
      'days': 24 * 60 * 60 * 1000,
      'weeks': 7 * 24 * 60 * 60 * 1000,
      'months': 30 * 24 * 60 * 60 * 1000
    };
    
    return amount * (multipliers[unit] || 1000);
  }

  private emitEvent(event: WorkflowEvent): void {
    this.eventSubject.next(event);
  }

  // Additional stub implementations
  private async addToList(settings: any, context: WorkflowContext): Promise<ExecutionResult> {
    console.log('Adding to list:', settings.listId);
    return { success: true, data: { addedToList: settings.listId } };
  }

  private async removeFromList(settings: any, context: WorkflowContext): Promise<ExecutionResult> {
    console.log('Removing from list:', settings.listId);
    return { success: true, data: { removedFromList: settings.listId } };
  }

  private async updateContact(settings: any, context: WorkflowContext): Promise<ExecutionResult> {
    console.log('Updating contact fields:', settings.fields);
    Object.assign(context.contact, settings.fields);
    return { success: true, data: { fieldsUpdated: settings.fields } };
  }

  private async createTask(settings: any, context: WorkflowContext): Promise<ExecutionResult> {
    console.log('Creating task:', settings.title);
    return { success: true, data: { taskCreated: settings.title } };
  }

  private async sendSms(settings: any, context: WorkflowContext): Promise<ExecutionResult> {
    console.log('Sending SMS:', settings.message);
    return { success: true, data: { smsSent: true, message: settings.message } };
  }

  private async logEvent(settings: any, context: WorkflowContext): Promise<ExecutionResult> {
    console.log('Logging event:', settings.event, settings.data);
    return { success: true, data: { eventLogged: settings.event } };
  }

  private async waitUntil(settings: any, context: WorkflowContext): Promise<ExecutionResult> {
    console.log('Waiting until:', settings.datetime);
    return { success: true, data: { waitUntil: settings.datetime } };
  }

  private async waitForDay(settings: any, context: WorkflowContext): Promise<ExecutionResult> {
    console.log('Waiting for day:', settings.dayOfWeek, 'at', settings.time);
    return { success: true, data: { waitForDay: settings.dayOfWeek } };
  }

  private async waitForEvent(settings: any, context: WorkflowContext): Promise<ExecutionResult> {
    console.log('Waiting for event:', settings.event);
    return { success: true, data: { waitingForEvent: settings.event } };
  }

  private isInList(listId: string, context: WorkflowContext): boolean {
    return context.contact.lists?.includes(listId) || false;
  }

  private evaluateDateCondition(settings: any, context: WorkflowContext): boolean {
    // Simplified date condition evaluation
    return true;
  }

  private evaluateEngagementScore(settings: any, context: WorkflowContext): boolean {
    const score = context.contact.engagementScore || 0;
    switch (settings.operator) {
      case 'greater_than': return score > settings.score;
      case 'less_than': return score < settings.score;
      case 'equals': return score === settings.score;
      default: return false;
    }
  }

  private evaluateEmailBehavior(settings: any, context: WorkflowContext): boolean {
    // Simplified email behavior evaluation
    return Math.random() > 0.5;
  }

  // Public methods for workflow management
  public pauseExecution(executionId: string): void {
    const context = this.activeExecutions.get(executionId);
    if (context) {
      this.emitEvent({
        type: 'paused',
        executionId,
        timestamp: new Date()
      });
    }
  }

  public resumeExecution(executionId: string): void {
    // Implementation for resuming paused executions
  }

  public cancelExecution(executionId: string): void {
    this.activeExecutions.delete(executionId);
  }

  public getActiveExecutions(): WorkflowContext[] {
    return Array.from(this.activeExecutions.values());
  }
}