import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CurrencyOption } from '../models/localization';

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
  @Input({ required: true }) labels!: {
    searchProductLabel: string;
    searchProductPlaceholder: string;
    searchCurrencyFilterLabel: string;
    searchAnyCurrency: string;
    searchButton: string;
    searchingButton: string;
    searchIntroTitle: string;
    searchIntroDescription: string;
  };
  @Input({ required: true }) currencyOptions!: readonly CurrencyOption[];
  @Output() submitted = new EventEmitter<void>();
}
