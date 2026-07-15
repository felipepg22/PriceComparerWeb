import { Component, Input } from '@angular/core';
import { DashboardOffer } from '../models/product-search';

@Component({
  selector: 'app-offer-card',
  standalone: true,
  templateUrl: './offer-card.component.html',
  styleUrl: './offer-card.component.css'
})
export class OfferCardComponent {
  @Input({ required: true }) offer!: DashboardOffer;
  @Input({ required: true }) rank!: number;
  @Input() bestOverallLabel = '';
  @Input() bestOverallExplanation = '';
}
