import { Component, Input } from '@angular/core';

export type DashboardStateKind = 'loading' | 'empty' | 'validation' | 'error';

@Component({
  selector: 'app-state-message',
  standalone: true,
  templateUrl: './state-message.component.html',
  styleUrl: './state-message.component.css'
})
export class StateMessageComponent {
  @Input({ required: true }) kind!: DashboardStateKind;
  @Input() message = '';
  @Input({ required: true }) labels!: {
    loadingTitle: string;
    loadingDescription: string;
    emptyTitle: string;
    emptyDescription: string;
    validationTitle: string;
    validationDescription: string;
    errorTitle: string;
    errorDescription: string;
  };
}
