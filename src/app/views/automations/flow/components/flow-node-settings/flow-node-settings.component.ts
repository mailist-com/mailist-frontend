import { Component, input } from '@angular/core';
import { IFlowStateNode } from '../../models/i-flow-state-node';
import { NODE_PARAMS_MAP } from '../../constants/node-params-map';

@Component({
  selector: 'app-flow-node-settings',
  standalone: true,
  template: `
    @if (node(); as n) {
      <div>
        <h4>{{ defaultParams[n.type].name }}</h4>
        <p>ID: {{ n.id }}</p>
        <p>Type: {{ n.type }}</p>
      </div>
    }
  `,
  styles: [`
    h4 {
      margin-top: 0;
      font-size: 16px;
      font-weight: 500;
    }
    p {
      font-size: 12px;
      color: #666;
      word-break: break-all;
    }
  `]
})
export class FlowNodeSettingsComponent {
  public readonly node = input.required<IFlowStateNode>();
  protected readonly defaultParams = NODE_PARAMS_MAP;
}
