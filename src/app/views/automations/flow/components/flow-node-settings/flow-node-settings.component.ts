import { Component, input } from '@angular/core';
import { IFlowStateNode } from '../../models/i-flow-state-node';
import { NODE_PARAMS_MAP } from '../../constants/node-params-map';
import { NodeType } from '../../enums/node-type';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideInfo } from '@ng-icons/lucide';

@Component({
  selector: 'app-flow-node-settings',
  standalone: true,
  imports: [FormsModule, NgIcon],
  providers: [provideIcons({ lucideInfo })],
  templateUrl: './flow-node-settings.component.html',
  styleUrls: ['./flow-node-settings.component.scss']
})
export class FlowNodeSettingsComponent {
  public readonly node = input.required<IFlowStateNode>();
  protected readonly defaultParams = NODE_PARAMS_MAP;
  protected readonly NodeType = NodeType;

  // Form models
  protected emailSubject = '';
  protected emailContent = '';
  protected emailTemplate = '';
  protected waitDuration = 1;
  protected waitUnit = 'days';
  protected groupName = '';
  protected tagName = '';
  protected fieldName = '';
  protected fieldValue = '';
  protected webhookUrl = '';
  protected conditionField = '';
  protected conditionOperator = 'equals';
  protected conditionValue = '';
  protected splitPercentageA = 50;
  protected splitPercentageB = 50;
  protected dateField = '';
  protected linkUrl = '';
  protected formId = '';
  protected notificationMessage = '';

  getNodeIcon(nodeType: string): string {
    const params = NODE_PARAMS_MAP[nodeType as keyof typeof NODE_PARAMS_MAP];
    return params?.icon || 'lucideCircleHelp';
  }

  getNodeColor(nodeType: string): string {
    const params = NODE_PARAMS_MAP[nodeType as keyof typeof NODE_PARAMS_MAP];
    return params?.color || '#666';
  }
}
