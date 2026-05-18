import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metrics-summary',
  standalone: true,
  templateUrl: './metrics-summary.component.html',
  styleUrl: './metrics-summary.component.css'
})
export class MetricsSummaryComponent {
  @Input({ required: true }) foundOffers = 0;
  @Input({ required: true }) candidatePages = 0;
  @Input({ required: true }) attemptedSources = 0;
}
