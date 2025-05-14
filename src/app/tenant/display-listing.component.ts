import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TenantListingService } from './tenant-listing-service.service';
import { ToastService } from '../layout/toast.service';
import { CategoryService } from '../layout/category/category.service';
import { CountryService } from '../landlord/properties-create/location-step/location-step/country.service';
import { Listing } from '../landlord/model/listing.model';
import { Category } from '../layout/category/category.model';
import { map } from 'rxjs';
import { DisplayPicture } from '../landlord/model/picture.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AvatarComponent } from '../layout/avatar/avatar.component';
import { CommonModule } from '@angular/common';
import { BookDateComponent } from './book-date/book-date.component';

@Component({
  selector: 'app-display-listing',
  standalone: true,
  imports: [FontAwesomeModule, AvatarComponent, CommonModule, BookDateComponent],
  templateUrl: './display-listing.component.html',
  styleUrl: './display-listing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayListingComponent implements OnInit, OnDestroy {
  activatedRoute = inject(ActivatedRoute);
  tenantListingService = inject(TenantListingService);
  toastService = inject(ToastService);
  categoryService = inject(CategoryService);
  countryService = inject(CountryService);
  ref = inject(ChangeDetectorRef);

  listing: Listing | undefined;
  category: Category | undefined;
  currentPublicId = '';

  loading = signal(false);

  constructor() {
    this.listenToFetchListing();
  }

  private listenToFetchListing(): void {
    effect(
      () => {
        const state = this.tenantListingService.getOneSig();
        if (state.status === 'OK' && state.value && state.value.pictures) {
          this.listing = state.value;
          this.loading.set(false);
          this.listing!.pictures = this.putCoverPictureFirst(this.listing!.pictures);
          this.category = this.categoryService.getCategoryByTechnicalName(this.listing.category);
          this.countryService.getCountryByCode(this.listing.location).subscribe({
            next: (country) => {
              if (this.listing) {
                this.listing.location = country.region + ', ' + country.name.common;
                this.ref.markForCheck();
              }
            },
          });
        } else if (state.status === 'ERROR') {
          this.loading.set(false);
          this.toastService.send({
            severity: 'error',
            summary: 'Error',
            detail: "Something went wrong when fetching this listing`'s details",
          });
        }
      },
      { allowSignalWrites: true }
    );
  }

  public ngOnInit(): void {
    this.extractIdParamFromRouter();
  }
  private extractIdParamFromRouter() {
    this.activatedRoute.queryParams.pipe(map((params) => params['id'])).subscribe({
      next: (publicId: string) => {
        if (publicId) this.fetchListing(publicId);
      },
    });
  }
  private fetchListing(publicId: string) {
    this.currentPublicId = publicId;
    this.loading.set(true);
    this.tenantListingService.getOneByPublicId(this.currentPublicId);
  }
  public ngOnDestroy(): void {
    this.tenantListingService.resetGetOneByPublicId();
  }

  private putCoverPictureFirst(pictures: Array<DisplayPicture>) {
    const coverIndex = pictures.findIndex((picture) => picture.isCover);
    if (coverIndex) {
      const cover = pictures[coverIndex];
      pictures.splice(coverIndex, 1);
      pictures.unshift(cover);
    }
    return pictures;
  }
}
