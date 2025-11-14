import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { IFlowStateNode } from '../../models/i-flow-state-node';
import { NODE_PARAMS_MAP } from '../../constants/node-params-map';
import { NodeType } from '../../enums/node-type';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideInfo, lucideSave } from '@ng-icons/lucide';
import { FlowState } from '../../flow-state';

@Component({
  selector: 'app-flow-node-settings',
  standalone: true,
  imports: [FormsModule, NgIcon],
  providers: [provideIcons({ lucideInfo, lucideSave })],
  templateUrl: './flow-node-settings.component.html',
  styleUrls: ['./flow-node-settings.component.scss']
})
export class FlowNodeSettingsComponent {
  public readonly node = input.required<IFlowStateNode>();
  protected readonly defaultParams = NODE_PARAMS_MAP;
  protected readonly NodeType = NodeType;

  private readonly _state = inject(FlowState);

  // Form models as signals for reactive updates
  protected nodeName = signal('');
  protected nodeDescription = signal('');
  protected emailSubject = signal('');
  protected emailContent = signal('');
  protected emailTemplate = signal('');
  protected waitDuration = signal(1);
  protected waitUnit = signal('days');
  protected groupName = signal('');
  protected tagName = signal('');
  protected fieldName = signal('');
  protected fieldValue = signal('');
  protected webhookUrl = signal('');
  protected conditionField = signal('');
  protected conditionOperator = signal('equals');
  protected conditionValue = signal('');
  protected splitPercentageA = signal(50);
  protected splitPercentageB = signal(50);
  protected dateField = signal('');
  protected linkUrl = signal('');
  protected formId = signal('');
  protected notificationMessage = signal('');

  constructor() {
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
    this.emailSubject.set(data.emailSubject || '');
    this.emailContent.set(data.emailContent || '');
    this.emailTemplate.set(data.emailTemplate || '');
    this.waitDuration.set(data.waitDuration || 1);
    this.waitUnit.set(data.waitUnit || 'days');
    this.groupName.set(data.groupName || '');
    this.tagName.set(data.tagName || '');
    this.fieldName.set(data.fieldName || '');
    this.fieldValue.set(data.fieldValue || '');
    this.webhookUrl.set(data.webhookUrl || '');
    this.conditionField.set(data.conditionField || '');
    this.conditionOperator.set(data.conditionOperator || 'equals');
    this.conditionValue.set(data.conditionValue || '');
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
      if (this.emailSubject()) data.emailSubject = this.emailSubject();
      if (this.emailContent()) data.emailContent = this.emailContent();
      if (this.emailTemplate()) data.emailTemplate = this.emailTemplate();
    }

    if (nodeType === NodeType.Wait) {
      data.waitDuration = this.waitDuration();
      data.waitUnit = this.waitUnit();
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
}
