import {
  Component,
  effect,
  inject,
  input,
  signal,
  untracked,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  Type
} from '@angular/core';
import { IFlowStateNode } from '../../models/i-flow-state-node';
import { NODE_PARAMS_MAP } from '../../constants/node-params-map';
import { NodeType } from '../../enums/node-type';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideInfo, lucideSave } from '@ng-icons/lucide';
import { FlowState } from '../../flow-state';
import { CommonModule } from '@angular/common';
import { INodeSettings } from './settings/i-node-settings.interface';
import { SendEmailSettingsComponent } from './settings/send-email-settings/send-email-settings.component';
import { WaitSettingsComponent } from './settings/wait-settings/wait-settings.component';
import { ConditionSettingsComponent } from './settings/condition-settings/condition-settings.component';
import { GroupSettingsComponent } from './settings/group-settings/group-settings.component';
import { TagSettingsComponent } from './settings/tag-settings/tag-settings.component';

/**
 * Map of node types to their settings components
 * To add a new node type, create a new component implementing INodeSettings
 * and add it to this map
 */
const NODE_SETTINGS_COMPONENTS_MAP: Partial<Record<NodeType, Type<INodeSettings>>> = {
  [NodeType.SendEmail]: SendEmailSettingsComponent,
  [NodeType.Wait]: WaitSettingsComponent,
  [NodeType.Condition]: ConditionSettingsComponent,
  [NodeType.AddToGroup]: GroupSettingsComponent,
  [NodeType.RemoveFromGroup]: GroupSettingsComponent,
  [NodeType.SubscriberJoinsGroup]: GroupSettingsComponent,
  [NodeType.AddTag]: TagSettingsComponent,
  [NodeType.RemoveTag]: TagSettingsComponent,
  [NodeType.TagAdded]: TagSettingsComponent,
  [NodeType.TagRemoved]: TagSettingsComponent,
};

/**
 * Info texts for different node types when using GroupSettings or TagSettings
 */
const INFO_TEXTS: Partial<Record<NodeType, string>> = {
  [NodeType.AddToGroup]: 'Subskrybent zostanie dodany do wybranej grupy.',
  [NodeType.RemoveFromGroup]: 'Subskrybent zostanie usunięty z wybranej grupy.',
  [NodeType.SubscriberJoinsGroup]: 'Automatyzacja uruchomi się gdy subskrybent dołączy do wybranej grupy.',
  [NodeType.AddTag]: 'Tag zostanie dodany do subskrybenta.',
  [NodeType.RemoveTag]: 'Tag zostanie usunięty od subskrybenta.',
  [NodeType.TagAdded]: 'Automatyzacja uruchomi się gdy tag zostanie dodany do subskrybenta.',
  [NodeType.TagRemoved]: 'Automatyzacja uruchomi się gdy tag zostanie usunięty od subskrybenta.',
};

@Component({
  selector: 'app-flow-node-settings',
  standalone: true,
  imports: [FormsModule, NgIcon, CommonModule],
  providers: [provideIcons({ lucideInfo, lucideSave })],
  template: `
    @if (node(); as n) {
      <div class="node-settings">
        <!-- Node Header -->
        <div class="node-header">
          <div class="node-icon" [style.color]="getNodeColor(n.type)">
            <ng-icon [name]="getNodeIcon(n.type)"></ng-icon>
          </div>
          <div class="node-info">
            <h4 class="node-title">{{ defaultParams[n.type].name }}</h4>
            <span class="node-category">{{ defaultParams[n.type].category }}</span>
          </div>
        </div>

        <!-- General Settings -->
        <div class="settings-section">
          <label class="settings-label">Nazwa elementu</label>
          <input type="text" class="form-input form-input-sm" placeholder="Wprowadź nazwę..."
                 [ngModel]="nodeName()" (ngModelChange)="nodeName.set($event)" />
        </div>

        <div class="settings-section">
          <label class="settings-label">Opis</label>
          <textarea class="form-textarea form-input-sm" rows="2" placeholder="Dodaj opis (opcjonalnie)..."
                    [ngModel]="nodeDescription()" (ngModelChange)="nodeDescription.set($event)"></textarea>
        </div>

        <!-- Type-specific settings -->
        <div class="settings-divider"></div>

        <!-- Dynamic settings component container -->
        <ng-container #settingsContainer></ng-container>

        @if (!hasSettingsComponent(n.type)) {
          <div class="settings-info">
            <ng-icon name="lucideInfo"></ng-icon>
            <span>Ten typ węzła nie wymaga dodatkowych ustawień.</span>
          </div>
        }

        <!-- Save Button -->
        <div class="settings-divider"></div>
        <div class="settings-actions">
          <button class="btn btn-sm bg-primary text-white w-full" (click)="saveNodeData()" type="button">
            <div class="size-4 me-1"><ng-icon name="lucideSave"></ng-icon></div>
            Zastosuj zmiany
          </button>
        </div>
      </div>
    }
  `,
  styleUrls: ['./flow-node-settings.component.scss']
})
export class FlowNodeSettingsComponent {
  @ViewChild('settingsContainer', { read: ViewContainerRef, static: false })
  settingsContainer!: ViewContainerRef;

  public readonly node = input.required<IFlowStateNode>();
  protected readonly defaultParams = NODE_PARAMS_MAP;
  protected readonly NodeType = NodeType;

  private readonly _state = inject(FlowState);
  private _settingsComponentRef: ComponentRef<INodeSettings> | null = null;

  // General node fields
  protected nodeName = signal('');
  protected nodeDescription = signal('');

  constructor() {
    // Load node data when node changes
    effect(() => {
      const currentNode = this.node();
      untracked(() => {
        this.loadNodeData(currentNode);
        this.loadSettingsComponent(currentNode.type);
      });
    });
  }

  private loadNodeData(node: IFlowStateNode): void {
    const data = node.data || {};
    this.nodeName.set(data.name || '');
    this.nodeDescription.set(node.description || '');
  }

  private loadSettingsComponent(nodeType: NodeType): void {
    // Clear previous component
    if (this._settingsComponentRef) {
      this._settingsComponentRef.destroy();
      this._settingsComponentRef = null;
    }

    // Load new component if available
    const componentType = NODE_SETTINGS_COMPONENTS_MAP[nodeType];
    if (componentType && this.settingsContainer) {
      this.settingsContainer.clear();
      this._settingsComponentRef = this.settingsContainer.createComponent(componentType);

      // Set info text for reusable components
      const infoText = INFO_TEXTS[nodeType];
      if (infoText && 'infoText' in this._settingsComponentRef.instance) {
        (this._settingsComponentRef.instance as any).infoText = signal(infoText);
      }

      // Load data into settings component
      const nodeData = this.node().data || {};
      this._settingsComponentRef.instance.loadData(nodeData);
    }
  }

  protected saveNodeData(): void {
    const currentNode = this.node();
    const data: Record<string, any> = {};

    // Add general fields
    if (this.nodeName()) {
      data['name'] = this.nodeName();
    }

    // Add type-specific data from settings component
    if (this._settingsComponentRef) {
      const settingsData = this._settingsComponentRef.instance.exportData();
      Object.assign(data, settingsData);
    }

    // Update node in state
    this._state.update({
      nodes: {
        [currentNode.id]: {
          description: this.nodeDescription(),
          data
        }
      }
    }, 'updateNodeData');
  }

  protected hasSettingsComponent(nodeType: NodeType): boolean {
    return !!NODE_SETTINGS_COMPONENTS_MAP[nodeType];
  }

  protected getNodeIcon(nodeType: string): string {
    const params = NODE_PARAMS_MAP[nodeType as keyof typeof NODE_PARAMS_MAP];
    return params?.icon || 'lucideCircleHelp';
  }

  protected getNodeColor(nodeType: string): string {
    const params = NODE_PARAMS_MAP[nodeType as keyof typeof NODE_PARAMS_MAP];
    return params?.color || '#666';
  }
}
