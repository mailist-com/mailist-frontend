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

    this._state.update({
      nodes: {
        [currentNode.id]: {
          description: this.nodeDescription(),
          data: {
            name: this.nodeName(),
            emailSubject: this.emailSubject(),
            emailContent: this.emailContent(),
            emailTemplate: this.emailTemplate(),
            waitDuration: this.waitDuration(),
            waitUnit: this.waitUnit(),
            groupName: this.groupName(),
            tagName: this.tagName(),
            fieldName: this.fieldName(),
            fieldValue: this.fieldValue(),
            webhookUrl: this.webhookUrl(),
            conditionField: this.conditionField(),
            conditionOperator: this.conditionOperator(),
            conditionValue: this.conditionValue(),
            splitPercentageA: this.splitPercentageA(),
            splitPercentageB: this.splitPercentageB(),
            dateField: this.dateField(),
            linkUrl: this.linkUrl(),
            formId: this.formId(),
            notificationMessage: this.notificationMessage(),
          }
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
