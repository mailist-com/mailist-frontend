import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FFlowModule } from '@foblex/flow';
import { IFlowState } from "../../models/i-flow-state";
import { NODE_PARAMS_MAP } from "../../constants/node-params-map";
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMail, lucideClock, lucideCircleHelp } from '@ng-icons/lucide';

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
  providers: [provideIcons({ lucideMail, lucideClock, lucideCircleHelp })]
})
export class FlowPaletteComponent {

  public readonly viewModel = input.required<IFlowState>();
  public readonly isMinimized = input<boolean>(false);

  protected readonly groupedNodes = computed(() => {
    const allNodes = Object.entries(NODE_PARAMS_MAP).map(([key, data]) => ({
      ...data,
      type: key,
      disabled: false
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
