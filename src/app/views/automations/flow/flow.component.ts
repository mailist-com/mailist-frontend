import {
  ChangeDetectionStrategy,
  Component, computed, effect, inject, Injector, input, OnInit, signal, untracked, viewChild,
} from '@angular/core';
import {
  EFMarkerType, FCanvasChangeEvent,
  FCanvasComponent,
  FCreateConnectionEvent, FCreateNodeEvent,
  FFlowComponent,
  FFlowModule, FMoveNodesEvent,
  FReassignConnectionEvent, FSelectionChangeEvent, FZoomDirective,
} from '@foblex/flow';
import {FormsModule} from '@angular/forms';
import {FlowActionPanelAction} from './components/flow-action-panel/enums/flow-action-panel-action';
import {A, BACKSPACE, DASH, DELETE, NUMPAD_MINUS, NUMPAD_PLUS} from '@angular/cdk/keycodes';
import {EOperationSystem, PlatformService} from '@foblex/platform';
import {FlowApiService} from "./providers/flow-api.service";
import {FlowState} from "./flow-state";
import {IFlowState} from "./models/i-flow-state";
import {IFlowStateNode} from "./models/i-flow-state-node";
import { FlowNodeComponent } from './components/flow-node/flow-node.component';
import { FlowActionPanelComponent } from './components/flow-action-panel/flow-action-panel.component';
import { FlowPaletteComponent }from './components/flow-palette/flow-palette.component';
import { generateGuid } from '@foblex/utils';
import { FlowNodeSettingsComponent } from './components/flow-node-settings/flow-node-settings.component';
import { PageTitle } from '../../../components/page-title/page-title';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSave, lucideSearch, lucidePanelLeft, lucidePanelRight, lucideX, lucideEdit, lucideCheck } from '@ng-icons/lucide';
import { Router } from '@angular/router';
import { AutomationService } from '../../../services/automation.service';

@Component({
  selector: 'app-flow',
  templateUrl: './flow.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FFlowModule,
    FlowNodeComponent,
    FlowActionPanelComponent,
    FlowPaletteComponent,
    FormsModule,
    FlowNodeSettingsComponent,
    PageTitle,
    NgIcon,
  ],
  providers: [provideIcons({ lucideSave, lucideSearch, lucidePanelLeft, lucidePanelRight, lucideX, lucideEdit, lucideCheck })],
  styles: [`
    :host ::ng-deep .f-flow-background {
      background-color: #f9fafb;
      background-image: radial-gradient(circle, #d1d5db 1px, transparent 1px);
      background-size: 20px 20px;
    }
  `]
})
export class FlowComponent implements OnInit {

  public readonly id = input<string>();

  private readonly _state = inject(FlowState);
  private readonly _apiService = inject(FlowApiService);
  private readonly _injector = inject(Injector);
  private readonly _platform = inject(PlatformService);
  private readonly _automationService = inject(AutomationService);
  private readonly _router = inject(Router);

  private readonly _flow = viewChild(FFlowComponent);
  private readonly _canvas = viewChild(FCanvasComponent);
  private readonly _zoom = viewChild(FZoomDirective);

  protected readonly fCanvasChangeEventDebounce = 200;

  protected readonly viewModel = signal<IFlowState | undefined>(undefined);
  protected readonly selectedNode = signal<IFlowStateNode | undefined>(undefined);
  protected readonly isLeftSidebarMinimized = signal(false);
  protected readonly isEditingName = signal(false);
  protected readonly editingNameValue = signal('');

  protected readonly nodes = computed(() => {
    return Object.values(this.viewModel()?.nodes || {});
  });

  protected readonly connections = computed(() => {
    return Object.values(this.viewModel()?.connections || {});
  });

  protected eMarkerType = EFMarkerType;

  public ngOnInit(): void {
    this._initializeState();
    this._listenStateChanges();
  }

  private _initializeState(): void {
    effect(() => {
      const id = this.id() || generateGuid();
      console.log('[FlowComponent] Initializing state with ID:', id);
      console.log('[FlowComponent] ID from input:', this.id());
      untracked(() => {
        this._state.initialize(this._apiService.getFlowById(id))
      });
    }, {injector: this._injector});
  }

  protected reset(): void {
    this._flow()?.reset();
    const currentId = this.id() || generateGuid();
    this._apiService.resetFlow(currentId);
    this._initializeState();
  }

  private _listenStateChanges(): void {
    effect(() => {
      this._state.changes(); // Trigger effect on state changes
      untracked(() => {
        const model = this._state.getSnapshot();
        const currentId = this.id() || generateGuid();
        this._apiService.saveFlow(model, currentId);
        this._applyChanges(model);
      });
    }, {injector: this._injector});
  }

  private _applyChanges(model: IFlowState): void {
    this.viewModel.set(model);
    if (!this.viewModel()) {
      return;
    }
    this._applySelectionChanges(this.viewModel()!);
    this.updateSelectedNode(this.viewModel()!);
  }

  private updateSelectedNode(model: IFlowState): void {
    const selectedNodeId = model.selection?.nodes[0];
    if (selectedNodeId) {
      this.selectedNode.set(model.nodes[selectedNodeId]);
      // Don't auto-minimize the palette when selecting a node
    } else {
      this.selectedNode.set(undefined);
    }
  }

  protected toggleLeftSidebar(): void {
    this.isLeftSidebarMinimized.set(!this.isLeftSidebarMinimized());
  }

  protected closeSettings(): void {
    this.selectedNode.set(undefined);
    const selection = this.viewModel()?.selection;
    if (selection) {
      this._apiService.changeSelection({ fNodeIds: [], fConnectionIds: selection.connections, fGroupIds: [] });
    }
  }

  private _applySelectionChanges({selection}: IFlowState): void {
    this._flow()?.select(selection?.nodes || [], selection?.connections || [], false);
  }

  protected editorLoaded(): void {
    this._canvas()?.resetScaleAndCenter(false);
  }

  protected changeCanvasTransform(event: FCanvasChangeEvent): void {
    this._apiService.transformCanvas(event);
  }

  protected createNode(event: FCreateNodeEvent): void {
    this._apiService.createNode(event);
  }

  protected moveNodes(event: FMoveNodesEvent): void {
    this._apiService.moveNodes(event);
  }

  protected createConnection(event: FCreateConnectionEvent): void {
    this._apiService.createConnection(event);
  }

  protected reassignConnection(event: FReassignConnectionEvent): void {
    this._apiService.reassignConnection(event);
  }

  protected changeSelection(event: FSelectionChangeEvent): void {
    this._apiService.changeSelection(event);
  }

  protected removeConnection(outputId: string): void {
    this._apiService.removeConnection(outputId, this.viewModel()!);
  }

  private _selectAll(): void {
    this._flow()?.selectAll();
    this._apiService.selectAll(this.viewModel()!);
  }

  protected processAction(event: FlowActionPanelAction): void {
    switch (event) {
      case FlowActionPanelAction.SELECT_ALL:
        this._selectAll();
        break;
      case FlowActionPanelAction.ZOOM_IN:
        this._zoom()?.zoomIn();
        break;
      case FlowActionPanelAction.ZOOM_OUT:
        this._zoom()?.zoomOut();
        break;
      case FlowActionPanelAction.FIT_TO_SCREEN:
        this._canvas()?.fitToScreen();
        break;
      case FlowActionPanelAction.ONE_TO_ONE:
        this._canvas()?.resetScaleAndCenter();
        break;
    }
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    switch (event.keyCode) {
      case BACKSPACE:
      case DELETE:
        this._apiService.removeSelected(this.viewModel()!);
        break;
      case NUMPAD_PLUS:
        if (this._isCommandButton(event)) {
          this._zoom()?.zoomIn();
        }
        break;
      case NUMPAD_MINUS:
      case DASH:
        if (this._isCommandButton(event)) {
          this._zoom()?.zoomOut();
        }
        break;
      case A:
        if (this._isCommandButton(event)) {
          this._selectAll();
        }
        break;
    }
  }

  private _isCommandButton(event: { metaKey: boolean, ctrlKey: boolean }): boolean {
    return this._platform.getOS() === EOperationSystem.MAC_OS ? event.metaKey : event.ctrlKey;
  }

  protected saveAutomation(): void {
    const currentState = this._state.getSnapshot();
    const currentId = this.id();

    console.log('[FlowComponent] Saving automation');
    console.log('[FlowComponent] Current ID:', currentId);
    console.log('[FlowComponent] Current state nodes:', Object.keys(currentState.nodes || {}).length);

    if (currentId) {
      // Update existing automation
      console.log('[FlowComponent] Updating existing automation:', currentId);
      // Save flow to localStorage with automation ID
      this._apiService.saveFlow(currentState, currentId);

      this._automationService.updateAutomation(currentId, {
        flowData: currentState,
        name: currentState.name || 'Automatyzacja'
      }).subscribe({
        next: () => {
          console.log('[FlowComponent] Automation updated successfully');
          this._router.navigate(['/automations']);
        },
        error: (error) => {
          console.error('[FlowComponent] Error updating automation:', error);
        }
      });
    } else {
      // Create new automation
      console.log('[FlowComponent] Creating new automation');
      this._automationService.createAutomation({
        name: currentState.name || 'Nowa automatyzacja',
        description: 'Automatyzacja stworzona w edytorze flow',
        type: 'custom',
        flowData: currentState
      }).subscribe({
        next: (automation) => {
          console.log('[FlowComponent] Automation created successfully with ID:', automation.id);
          // Save flow to localStorage with the new automation ID
          this._apiService.saveFlow(currentState, automation.id);
          this._router.navigate(['/automations']);
        },
        error: (error) => {
          console.error('[FlowComponent] Error creating automation:', error);
        }
      });
    }
  }

  protected cancel(): void {
    this._router.navigate(['/automations']);
  }

  protected startEditingName(): void {
    const currentName = this.viewModel()?.name || 'Nowa automatyzacja';
    this.editingNameValue.set(currentName);
    this.isEditingName.set(true);
  }

  protected saveName(): void {
    const newName = this.editingNameValue().trim();
    if (newName) {
      this._state.update({
        name: newName
      }, 'updateName');
    }
    this.isEditingName.set(false);
  }

  protected cancelEditingName(): void {
    this.isEditingName.set(false);
  }

  protected onNameKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.saveName();
    } else if (event.key === 'Escape') {
      this.cancelEditingName();
    }
  }
}
