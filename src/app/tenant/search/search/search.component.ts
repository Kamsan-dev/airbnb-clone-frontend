import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { NewListingInfo } from '../../../landlord/model/listing.model';
import { InfoStepComponent } from '../../../landlord/properties-create/info-step/info-step.component';
import { LocationMapComponent } from '../../../landlord/properties-create/location-step/location-step/location-map/location-map/location-map.component';
import { Step } from '../../../landlord/properties-create/step.model';
import { FooterStepComponent } from '../../../shared/components/footer-step/footer-step.component';
import { BookedDatesDTOFromServer } from '../../model/booking.model';
import { Search } from '../../model/search.model';
import { TenantListingService } from '../../tenant-listing-service.service';
import { JsonPipe } from '@angular/common';
import { SearchDateComponent } from './searchDate/search-date/search-date.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FooterStepComponent, InfoStepComponent, LocationMapComponent, JsonPipe, SearchDateComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  LOCATION = 'location';
  DATES = 'dates';
  INFO = 'infos';

  public dialogDynamicRef = inject(DynamicDialogRef);
  public tenantListingService = inject(TenantListingService);
  public router = inject(Router);

  public steps: Step[] = [
    {
      id: this.LOCATION,
      idNext: this.DATES,
      idPrevious: null,
      isValid: false,
    },
    {
      id: this.DATES,
      idNext: this.INFO,
      idPrevious: this.LOCATION,
      isValid: false,
    },
    {
      id: this.INFO,
      idNext: null,
      idPrevious: this.DATES,
      isValid: false,
    },
  ];
  public currentStep = this.steps[0];

  newSearch: Search = {
    dates: {
      startDate: new Date(),
      endDate: new Date(),
    },
    infos: {
      guests: { value: 0 },
      baths: { value: 0 },
      bedrooms: { value: 0 },
      beds: { value: 0 },
    },
    location: '',
  };

  loadingSearch = false;

  public nextStep(): void {
    if (this.currentStep.idNext != null) {
      this.currentStep = this.steps.filter((step) => step.id === this.currentStep.idNext)[0];
    }
  }

  public previousStep(): void {
    if (this.currentStep.idPrevious != null) {
      this.currentStep = this.steps.filter((step) => step.id === this.currentStep.idPrevious)[0];
    }
  }

  public isAllStepsValid(): boolean {
    return this.steps.every((step) => step.isValid === true);
  }

  public onLocationChange(newLocation: string) {
    this.currentStep.isValid = true;
    this.newSearch.location = newLocation;
  }

  public onInfoChange(newInfo: NewListingInfo) {
    this.newSearch.infos = newInfo;
  }

  public onDateChange(dates: BookedDatesDTOFromServer) {
    this.newSearch.dates = dates;
  }

  public onValidityChange(validity: boolean) {
    this.currentStep.isValid = validity;
  }

  onSearchClick(): void {
    this.loadingSearch = true;
    this.router.navigate(['/'], {
      queryParams: {
        location: this.newSearch.location,
        guests: this.newSearch.infos.guests.value,
        bedrooms: this.newSearch.infos.bedrooms.value,
        beds: this.newSearch.infos.bedrooms.value,
        baths: this.newSearch.infos.baths.value,
        startDate: dayjs(this.newSearch.dates.startDate).format('YYYY-MM-DD'),
        endDate: dayjs(this.newSearch.dates.endDate).format('YYYY-MM-DD'),
      },
    });
    this.dialogDynamicRef.close();
  }
}
