import { CommonModule, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from '../../core/auth.service';
import { State } from '../../core/model/state.mode';
import { CategoryName } from '../../layout/category/category.model';
import { ToastService } from '../../layout/toast.service';
import { FooterStepComponent } from '../../shared/components/footer-step/footer-step.component';
import { LandlordListingService } from '../landlord-listing.service';
import { PriceVo } from '../model/listing-vo.model';
import { CreatedListing, Description, newListing, NewListingInfo } from '../model/listing.model';
import { NewListingPicture } from '../model/picture.model';
import { CategoryStepComponent } from './category-step/category-step/category-step.component';
import { DescriptionStepComponent } from './description-step/description-step/description-step.component';
import { InfoStepComponent } from './info-step/info-step.component';
import { LocationStepComponent } from './location-step/location-step/location-step.component';
import { PictureStepComponent } from './picture-step/picture-step/picture-step.component';
import { PriceStepComponent } from './price-step/price-step/price-step.component';
import { Step } from './step.model';

@Component({
  selector: 'app-properties-create',
  standalone: true,
  imports: [
    CategoryStepComponent,
    CommonModule,
    FooterStepComponent,
    LocationStepComponent,
    InfoStepComponent,
    PictureStepComponent,
    DescriptionStepComponent,
    PriceStepComponent,
  ],
  templateUrl: './properties-create.component.html',
  styleUrl: './properties-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertiesCreateComponent {
  // constants

  public CATEGORY = 'category';
  public LOCATION = 'location';
  public INFO = 'info';
  public PHOTOS = 'photos';
  public DESCRIPTION = 'description';
  public PRICE = 'price';

  public dialogDynamicRef = inject(DynamicDialogRef);
  public landlordListingService = inject(LandlordListingService);
  public toastService = inject(ToastService);
  public userService = inject(AuthService);
  public router = inject(Router);

  public steps: Step[] = [
    {
      id: this.CATEGORY,
      idNext: this.LOCATION,
      idPrevious: null,
      isValid: false,
    },
    {
      id: this.LOCATION,
      idNext: this.INFO,
      idPrevious: this.CATEGORY,
      isValid: false,
    },
    {
      id: this.INFO,
      idNext: this.PHOTOS,
      idPrevious: this.LOCATION,
      isValid: false,
    },
    {
      id: this.PHOTOS,
      idNext: this.DESCRIPTION,
      idPrevious: this.INFO,
      isValid: false,
    },
    {
      id: this.DESCRIPTION,
      idNext: this.PRICE,
      idPrevious: this.PHOTOS,
      isValid: false,
    },
    {
      id: this.PRICE,
      idNext: null,
      idPrevious: this.DESCRIPTION,
      isValid: false,
    },
  ];

  public currentStep = this.steps[0];

  public newListing: newListing = {
    category: 'AMAZING_VIEWS',
    infos: {
      guests: { value: 0 },
      bedrooms: { value: 0 },
      beds: { value: 0 },
      baths: { value: 0 },
    },
    location: '',
    pictures: new Array<NewListingPicture>(),
    description: {
      title: { value: '' },
      description: { value: '' },
    },
    price: { value: 0 },
  };

  public loadingCreation = false;

  public constructor() {
    this.listenFetchUser();
    this.listenListingCreation();
  }

  public createListing(): void {
    this.loadingCreation = true;
    this.landlordListingService.create(this.newListing);
  }

  public listenListingCreation(): void {
    effect(
      () => {
        let newCreatedListing = this.landlordListingService.createSig();
        if (newCreatedListing.status === 'OK') {
          this.onCreateOk(newCreatedListing);
        } else if (newCreatedListing.status === 'ERROR') {
          this.onCreateError();
        }
      },
      { allowSignalWrites: true }
    );
  }

  public listenFetchUser() {
    effect(() => {
      if (this.userService.fetchUser().status === 'OK' && this.landlordListingService.createSig().status === 'OK') {
        this.router.navigate(['landlord', 'properties']);
      }
    });
  }

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

  //#region events

  public onCreateOk(newListing: State<CreatedListing>) {
    this.loadingCreation = false;
    this.toastService.send({
      severity: 'success',
      summary: 'Success',
      detail: 'Listing created successfully.',
    });
    this.dialogDynamicRef.close(newListing.value?.publicId);
    this.landlordListingService.resetListingCreation();
    this.userService.renewAccessToken();
  }

  public onCreateError() {
    this.loadingCreation = false;
    this.toastService.send({
      severity: 'error',
      summary: 'Error',
      detail: "Couldn't create your listing, please try again.",
    });
  }

  public onCategoryChange(newCategory: CategoryName): void {
    this.newListing.category = newCategory;
  }

  public onValidityChange(validity: boolean) {
    this.currentStep.isValid = validity;
  }

  public onLocationChange(newLocation: string) {
    this.newListing.location = newLocation;
  }

  public onInfoChange(newInfo: NewListingInfo) {
    this.newListing.infos = newInfo;
  }

  public onPictureChange(newPictures: NewListingPicture[]) {
    this.newListing.pictures = newPictures;
  }

  public onDescriptionChange(newDescription: Description) {
    this.newListing.description = newDescription;
  }

  public onPriceChange(newPrice: PriceVo) {
    this.newListing.price = newPrice;
  }
}
