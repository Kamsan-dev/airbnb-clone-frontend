import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, EventEmitter, inject, input, Output, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DisplayCardListing } from '../../../../landlord/model/listing.model';
import { Country } from '../../../../landlord/properties-create/location-step/location-step/country.model';
import { CountryService } from '../../../../landlord/properties-create/location-step/location-step/country.service';
import { CategoryService } from '../../../../layout/category/category.service';
import { BookedListing } from '../../../../tenant/model/booking.model';

export type cardModeType = 'landlord' | 'booking';

@Component({
  selector: 'app-card-listing',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './card-listing.component.html',
  styleUrl: './card-listing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardListingComponent {
  listing = input.required<DisplayCardListing | BookedListing>();

  cardMode = input<cardModeType>();

  bookingListing: WritableSignal<BookedListing | undefined> = signal(undefined);
  cardListing: WritableSignal<DisplayCardListing | undefined> = signal(undefined);
  publicId: string | undefined; // publicId of the current listing (booking or landlord listing)

  router = inject(Router);
  categoryService = inject(CategoryService);
  countryService = inject(CountryService);
  ref = inject(ChangeDetectorRef);

  @Output()
  deleteListing = new EventEmitter<DisplayCardListing>();
  @Output()
  cancelBooking = new EventEmitter<BookedListing>();

  constructor() {
    this.listenToListing();
    this.listenToCardMode();
  }

  private listenToListing(): void {
    effect(() => {
      const listing = this.listing();
      this.countryService.getCountryByCode(listing.location).subscribe({
        next: (country: Country) => {
          if (listing) {
            this.listing().location = country.region + ', ' + country.name.common;
            this.ref.markForCheck();
          }
        },
      });
    });
  }

  private listenToCardMode(): void {
    effect(
      () => {
        const cardMode = this.cardMode();
        if (cardMode && cardMode === 'booking') {
          this.bookingListing.set(this.listing() as BookedListing);
          this.publicId = this.bookingListing()?.bookingPublicId!;
        } else {
          this.cardListing.set(this.listing() as DisplayCardListing);
          this.publicId = this.cardListing()?.publicId!;
        }
      },
      { allowSignalWrites: true }
    );
  }

  onDeleteListing(listing: DisplayCardListing): void {
    this.deleteListing.emit(listing);
  }

  onCancelBooking(booking: BookedListing): void {
    this.cancelBooking.emit(booking);
  }

  onClickCard(): void {
    //const id = this.cardMode() === 'booking' ? this.bookingListing?.bookingPublicId! : this.cardListing?.publicId!;
    this.router.navigate(['/listing'], { queryParams: { id: this.publicId } });
  }
}
