import { Component, input, Output, EventEmitter } from '@angular/core';
import { FFlowModule } from '@foblex/flow';
import { NODE_PARAMS_MAP } from '../../../constants/node-params-map';
import { NodeType } from '../../../enums/node-type';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideMail,
  lucideClock,
  lucideCircleHelp,
  lucideTrash2,
  lucideUserPlus,
  lucideUserMinus,
  lucideFileText,
  lucideMousePointerClick,
  lucideEdit,
  lucideTag,
  lucideTagOff,
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
  selector: 'app-flow-node-header',
  templateUrl: './flow-node-header.component.html',
  styleUrls: ['./flow-node-header.component.scss'],
  standalone: true,
  imports: [
    FFlowModule,
    NgIcon
  ],
  providers: [provideIcons({
    lucideMail,
    lucideClock,
    lucideCircleHelp,
    lucideTrash2,
    lucideUserPlus,
    lucideUserMinus,
    lucideFileText,
    lucideMousePointerClick,
    lucideEdit,
    lucideTag,
    lucideTagOff,
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
export class FlowNodeHeaderComponent {
  protected readonly defaultParams = NODE_PARAMS_MAP;

  public readonly description = input.required<string | undefined>();
  public readonly type = input.required<NodeType>();

  @Output() deleteNode = new EventEmitter<void>();
}
