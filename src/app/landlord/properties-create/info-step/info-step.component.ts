import { Component, EventEmitter, input, Output } from '@angular/core';
import { NewListingInfo } from '../../model/listing.model';
import { InfoStepControlComponent } from './info-step-control/info-step-control/info-step-control.component';

export type Control = 'GUESTS' | 'BEDROOMS' | 'BEDS' | 'BATHS';
@Component({
  selector: 'app-info-step',
  standalone: true,
  imports: [InfoStepControlComponent],
  templateUrl: './info-step.component.html',
  styleUrl: './info-step.component.scss',
})
export class InfoStepComponent {
  infos = input.required<NewListingInfo>();

  @Output()
  infoChange = new EventEmitter<NewListingInfo>();

  @Output()
  stepValidityChange = new EventEmitter<boolean>();

  onInfoChange(newValue: number, type: Control): void {
    switch (type) {
      case 'GUESTS':
        this.infos().guests = { value: newValue };
        break;
      case 'BEDROOMS':
        this.infos().bedrooms = { value: newValue };
        break;
      case 'BEDS':
        this.infos().beds = { value: newValue };
        break;
      case 'BATHS':
        this.infos().baths = { value: newValue };
        break;
    }
    this.infoChange.emit(this.infos());
    this.stepValidityChange.emit(this.validationRules());
  }

  private validationRules(): boolean {
    return this.infos().guests.value > 0;
  }
}
