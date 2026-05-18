import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-panel',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search-panel.component.html',
  styleUrl: './search-panel.component.css'
})
export class SearchPanelComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() loading = false;
  @Output() submitted = new EventEmitter<void>();
}
