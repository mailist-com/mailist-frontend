import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FFlowModule } from '@foblex/flow';
import { IFlowState } from "../../models/i-flow-state";
import { NODE_PARAMS_MAP } from "../../constants/node-params-map";
import { NodeType } from "../../enums/node-type";
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideMail,
  lucideClock,
  lucideCircleHelp,
  lucideUserPlus,
  lucideUserMinus,
  lucideFileText,
  lucideMousePointerClick,
  lucidePencil,
  lucideTag,
  lucideX,
  lucideMailOpen,
  lucideCalendar,
  lucideWebhook,
  lucideBell,
  lucideGitBranch,
  lucideShuffle,
  lucideTarget
} from '@ng-icons/lucide';

@Component({
  selector: 'app-flow-palette',
  templateUrl: './flow-palette.component.html',
  styleUrls: ['./flow-palette.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FFlowModule,
    NgIcon
  ],
  providers: [provideIcons({
    lucideMail,
    lucideClock,
    lucideCircleHelp,
    lucideUserPlus,
    lucideUserMinus,
    lucideFileText,
    lucideMousePointerClick,
    lucidePencil,
    lucideTag,
    lucideX,
    lucideMailOpen,
    lucideCalendar,
    lucideWebhook,
    lucideBell,
    lucideGitBranch,
    lucideShuffle,
    lucideTarget
  })]
})
export class FlowPaletteComponent {

  public readonly viewModel = input.required<IFlowState>();
  public readonly isMinimized = input<boolean>(false);

  // Trigger node types
  private readonly triggerTypes = [
    NodeType.SubscriberJoinsGroup,
    NodeType.TagAdded,
    NodeType.TagRemoved,
    NodeType.EmailOpened,
    NodeType.Unsubscribed
  ];

  protected readonly groupedNodes = computed(() => {
    const vm = this.viewModel();

    // Check if a trigger already exists in the flow
    const hasTrigger = Object.values(vm.nodes || {}).some(node =>
      this.triggerTypes.includes(node.type)
    );

    const allNodes = Object.entries(NODE_PARAMS_MAP).map(([key, data]) => ({
      ...data,
      type: key,
      // Disable trigger nodes if a trigger already exists
      disabled: hasTrigger && this.triggerTypes.includes(key as NodeType)
    }));

    return allNodes.reduce((acc, node) => {
      const category = node.category || 'Inne';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(node);
      return acc;
    }, {} as { [key: string]: typeof allNodes });
  });

  protected readonly categories = computed(() => {
    return Object.keys(this.groupedNodes());
  });
}
