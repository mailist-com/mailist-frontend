import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { IFlowStateNode } from '../../models/i-flow-state-node';
import { NODE_PARAMS_MAP } from '../../constants/node-params-map';
import { NodeType } from '../../enums/node-type';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideInfo, lucideSave } from '@ng-icons/lucide';
import { FlowState } from '../../flow-state';
import { TemplateService } from '../../../../../services/template.service';
import { Template } from '../../../../../models/template.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flow-node-settings',
  standalone: true,
  imports: [FormsModule, NgIcon, CommonModule],
  providers: [provideIcons({ lucideInfo, lucideSave })],
  templateUrl: './flow-node-settings.component.html',
  styleUrls: ['./flow-node-settings.component.scss']
})
export class FlowNodeSettingsComponent {
  public readonly node = input.required<IFlowStateNode>();
  protected readonly defaultParams = NODE_PARAMS_MAP;
  protected readonly NodeType = NodeType;

  private readonly _state = inject(FlowState);
  private readonly _templateService = inject(TemplateService);

  // Available templates
  protected availableTemplates = signal<Template[]>([]);

  // Form models as signals for reactive updates
  protected nodeName = signal('');
  protected nodeDescription = signal('');

  // SendEmail fields
  protected emailMode = signal<'simple' | 'template'>('simple'); // simple or template mode
  protected emailSubject = signal('');
  protected emailContent = signal('');
  protected emailTemplateId = signal('');

  // Wait fields
  protected waitMode = signal<'duration' | 'until'>('duration'); // duration or until date
  protected waitDuration = signal(1);
  protected waitUnit = signal<'minutes' | 'hours' | 'days' | 'weeks'>('days');
  protected waitUntilDate = signal('');
  protected waitUntilTime = signal('09:00');

  // Group fields
  protected groupName = signal('');

  // Tag fields
  protected tagName = signal('');

  // Condition fields
  protected conditionField = signal('');
  protected conditionOperator = signal<'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater' | 'less' | 'exists' | 'not_exists'>('equals');
  protected conditionValue = signal('');

  // Other fields
  protected fieldName = signal('');
  protected fieldValue = signal('');
  protected webhookUrl = signal('');
  protected splitPercentageA = signal(50);
  protected splitPercentageB = signal(50);
  protected dateField = signal('');
  protected linkUrl = signal('');
  protected formId = signal('');
  protected notificationMessage = signal('');

  constructor() {
    // Load templates
    this._templateService.getTemplates().subscribe(templates => {
      this.availableTemplates.set(templates.filter(t => t.status === 'active'));
    });

    // Load node data when node changes
    effect(() => {
      const currentNode = this.node();
      untracked(() => {
        this.loadNodeData(currentNode);
      });
    });
  }

  private loadNodeData(node: IFlowStateNode): void {
    const data = node.data || {};

    this.nodeName.set(data.name || '');
    this.nodeDescription.set(node.description || '');

    // SendEmail
    this.emailMode.set(data.emailMode || 'simple');
    this.emailSubject.set(data.emailSubject || '');
    this.emailContent.set(data.emailContent || '');
    this.emailTemplateId.set(data.emailTemplateId || '');

    // Wait
    this.waitMode.set(data.waitMode || 'duration');
    this.waitDuration.set(data.waitDuration || 1);
    this.waitUnit.set(data.waitUnit || 'days');
    this.waitUntilDate.set(data.waitUntilDate || '');
    this.waitUntilTime.set(data.waitUntilTime || '09:00');

    // Group
    this.groupName.set(data.groupName || '');

    // Tag
    this.tagName.set(data.tagName || '');

    // Condition
    this.conditionField.set(data.conditionField || '');
    this.conditionOperator.set(data.conditionOperator || 'equals');
    this.conditionValue.set(data.conditionValue || '');

    // Other
    this.fieldName.set(data.fieldName || '');
    this.fieldValue.set(data.fieldValue || '');
    this.webhookUrl.set(data.webhookUrl || '');
    this.splitPercentageA.set(data.splitPercentageA || 50);
    this.splitPercentageB.set(data.splitPercentageB || 50);
    this.dateField.set(data.dateField || '');
    this.linkUrl.set(data.linkUrl || '');
    this.formId.set(data.formId || '');
    this.notificationMessage.set(data.notificationMessage || '');
  }

  protected updateNodeData(): void {
    const currentNode = this.node();
    const nodeType = currentNode.type;

    // Build data object based on node type
    const data: any = {};

    // Always save name if provided
    if (this.nodeName()) {
      data.name = this.nodeName();
    }

    // Save fields based on node type
    if (nodeType === NodeType.SendEmail) {
      data.emailMode = this.emailMode();
      if (this.emailMode() === 'simple') {
        if (this.emailSubject()) data.emailSubject = this.emailSubject();
        if (this.emailContent()) data.emailContent = this.emailContent();
      } else {
        if (this.emailTemplateId()) data.emailTemplateId = this.emailTemplateId();
      }
    }

    if (nodeType === NodeType.Wait) {
      data.waitMode = this.waitMode();
      if (this.waitMode() === 'duration') {
        data.waitDuration = this.waitDuration();
        data.waitUnit = this.waitUnit();
      } else {
        data.waitUntilDate = this.waitUntilDate();
        data.waitUntilTime = this.waitUntilTime();
      }
    }

    if (nodeType === NodeType.Condition) {
      if (this.conditionField()) data.conditionField = this.conditionField();
      data.conditionOperator = this.conditionOperator();
      if (this.conditionValue()) data.conditionValue = this.conditionValue();
    }

    if (nodeType === NodeType.AddToGroup || nodeType === NodeType.RemoveFromGroup || nodeType === NodeType.SubscriberJoinsGroup) {
      if (this.groupName()) data.groupName = this.groupName();
    }

    if (nodeType === NodeType.AddTag || nodeType === NodeType.RemoveTag || nodeType === NodeType.TagAdded || nodeType === NodeType.TagRemoved) {
      if (this.tagName()) data.tagName = this.tagName();
    }

    this._state.update({
      nodes: {
        [currentNode.id]: {
          description: this.nodeDescription(),
          data
        }
      }
    }, 'updateNodeData');
  }

  getNodeIcon(nodeType: string): string {
    const params = NODE_PARAMS_MAP[nodeType as keyof typeof NODE_PARAMS_MAP];
    return params?.icon || 'lucideCircleHelp';
  }

  getNodeColor(nodeType: string): string {
    const params = NODE_PARAMS_MAP[nodeType as keyof typeof NODE_PARAMS_MAP];
    return params?.color || '#666';
  }

  protected getTemplateName(templateId: string): string {
    const template = this.availableTemplates().find(t => t.id === templateId);
    return template?.name || 'Nieznany szablon';
  }
}
