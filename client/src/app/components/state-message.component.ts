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
}
