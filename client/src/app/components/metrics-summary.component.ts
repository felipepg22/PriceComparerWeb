import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metrics-summary',
  standalone: true,
  templateUrl: './metrics-summary.component.html',
  styleUrl: './metrics-summary.component.css'
})
export class MetricsSummaryComponent {
  @Input({ required: true }) foundOffers = '';
  @Input({ required: true }) candidatePages = '';
  @Input({ required: true }) attemptedSources = '';
  @Input({ required: true }) labels!: {
    summaryAriaLabel: string;
    foundOffers: string;
    candidatePages: string;
    attemptedSources: string;
  };
}
