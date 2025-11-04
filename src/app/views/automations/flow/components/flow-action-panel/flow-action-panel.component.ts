import { ChangeDetectionStrategy, Component, effect, inject, Injector, input, OnInit, output, signal, untracked } from '@angular/core';
import { FlowActionPanelAction } from './enums/flow-action-panel-action';
import { FlowState } from "../../flow-state";
import { FlowApiService } from "../../providers/flow-api.service";
import { IFlowState } from "../../models/i-flow-state";
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUndo, lucideRedo, lucideTrash2, lucideLassoSelect, lucideZoomIn, lucideZoomOut, lucideExpand, lucideFocus, lucideRotateCcw } from '@ng-icons/lucide';

@Component({
  selector: 'app-flow-action-panel',
  templateUrl: './flow-action-panel.component.html',
  styleUrls: ['./flow-action-panel.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  providers: [provideIcons({ lucideUndo, lucideRedo, lucideTrash2, lucideLassoSelect, lucideZoomIn, lucideZoomOut, lucideExpand, lucideFocus, lucideRotateCcw })]
})
export class FlowActionPanelComponent implements OnInit {
  private readonly _injector = inject(Injector);
  private readonly _apiService = inject(FlowApiService);
  protected readonly state = inject(FlowState);

  public readonly processAction = output<FlowActionPanelAction>();
  public readonly resetFlow = output<void>();
  public readonly viewModel = input.required<IFlowState>();

  protected readonly action = FlowActionPanelAction;
  protected readonly canRemove = signal(false);

  public ngOnInit(): void {
    this._listenStateChanges();
  }

  private _listenStateChanges(): void {
    effect(() => {
      const model = this.viewModel();
      untracked(() => this.canRemove.set(this._calculateCanRemove(model)));
    }, {injector: this._injector});
  }

  private _calculateCanRemove(model: IFlowState): boolean {
    return (model.selection?.nodes || []).length > 0 || (model.selection?.connections || []).length > 0;
  }

  protected removeSelected(): void {
    this._apiService.removeSelected(this.viewModel());
  }

  protected reset(): void {
    this.resetFlow.emit();
  }
}
