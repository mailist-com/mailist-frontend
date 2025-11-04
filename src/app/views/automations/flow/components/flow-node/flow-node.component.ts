import { Component, input, output, inject } from '@angular/core';
import { FFlowModule } from '@foblex/flow';
import { NODE_PARAMS_MAP } from '../../constants/node-params-map';
import { IFlowStateNode } from '../../models/i-flow-state-node';
import { FlowNodeHeaderComponent } from './flow-node-header/flow-node-header.component';
import { FlowNodeFooterOutputsComponent } from './flow-node-footer-outputs/flow-node-footer-outputs.component';
import { NodeType } from '../../enums/node-type';
import { FlowApiService } from '../../providers/flow-api.service';
import { FlowState } from '../../flow-state';

@Component({
  selector: 'app-flow-node',
  templateUrl: './flow-node.component.html',
  standalone: true,
  imports: [
    FFlowModule,
    FlowNodeHeaderComponent,
    FlowNodeFooterOutputsComponent,
  ],
  styles: [`
    :host {
      min-width: 220px; /* Set a min-width for the host for positioning */
    }
    .node-wrapper {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      overflow: hidden; /* To contain the rounded corners of the header */
    }
    :host(.f-dragging) .node-wrapper {
      pointer-events: none;
    }
    :host(:not(.f-dragging):hover) .node-wrapper {
      border-color: rgba(59, 130, 246, 0.5);
      background-color: rgba(59, 130, 246, 0.05);
    }
    :host(.selected) .node-wrapper {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
    }
  `]
})
export class FlowNodeComponent {

  public readonly viewModel = input.required<IFlowStateNode>();

  public readonly removeConnection = output<string>();

  protected readonly defaultParams = NODE_PARAMS_MAP;
  protected readonly nodeType = NodeType;

  private readonly _apiService = inject(FlowApiService);
  private readonly _state = inject(FlowState);

  protected deleteNode(): void {
    const currentFlowState = this._state.getSnapshot();
    this._apiService.removeSelected({
      ...currentFlowState,
      selection: { nodes: [this.viewModel().id], connections: [], groups: [] }
    });
  }
}
