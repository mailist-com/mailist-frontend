import { Component, input, output } from '@angular/core';
import { FFlowModule } from '@foblex/flow';
import { INodeOutput } from "../../../models/i-flow-state-node";

@Component({
  selector: 'app-flow-node-footer-outputs',
  templateUrl: './flow-node-footer-outputs.component.html',
  styleUrls: ['./flow-node-footer-outputs.component.scss'],
  standalone: true,
  imports: [
    FFlowModule,
  ]
})
export class FlowNodeFooterOutputsComponent {
  public readonly removeConnection = output<string>();

  public readonly outputs = input.required<INodeOutput[]>();
}
