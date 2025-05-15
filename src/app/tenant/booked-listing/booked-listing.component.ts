import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ToastService } from '../../layout/toast.service';
import { BookedListing } from '../model/booking.model';
import { BookingService } from '../service/booking.service';
import { CardListingComponent } from '../../shared/components/card-listing/card-listing/card-listing.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-booked-listing',
  standalone: true,
  imports: [CardListingComponent, FontAwesomeModule],
  templateUrl: './booked-listing.component.html',
  styleUrl: './booked-listing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookedListingComponent implements OnInit, OnDestroy {
  private bookingService = inject(BookingService);
  private toastService = inject(ToastService);
  bookedListings = signal(new Array<BookedListing>());
  private ref = inject(ChangeDetectorRef);
  loading = signal(false);
  constructor() {
    this.listenFetchBooking();
    this.listenCancelBooking();
  }

  ngOnDestroy(): void {
    this.bookingService.resetCancel();
  }
  ngOnInit(): void {
    this.fetchBookings();
  }
  private fetchBookings() {
    this.loading.set(true);
    this.bookingService.getBookedListing();
  }

  private listenFetchBooking(): void {
    effect(
      () => {
        const state = this.bookingService.getBookedListingSig();
        if (state.value && state.status === 'OK') {
          this.bookedListings.set(state.value);
          this.loading.set(false);
        } else if (state.status === 'ERROR') {
          this.loading.set(false);
          this.toastService.send({
            severity: 'error',
            summary: 'Error when fetching the listing',
          });
        }
      },
      { allowSignalWrites: true }
    );
  }

  private listenCancelBooking(): void {
    effect(() => {
      const state = this.bookingService.cancelSig();
      if (state.value && state.status === 'OK') {
        const index = this.bookedListings().findIndex((bookedListing) => bookedListing.bookingPublicId === state.value);
        this.bookedListings().splice(index, 1);
        this.toastService.send({
          severity: 'success',
          summary: 'Successfully cancelled booking',
        });
      } else if (state.status === 'ERROR') {
        const index = this.bookedListings().findIndex((bookedListing) => bookedListing.bookingPublicId === state.value);
        this.bookedListings()[index].loading = false;
        this.toastService.send({
          severity: 'error',
          summary: 'Error when cancel your booking',
        });
      }
      this.ref.detectChanges();
    });
  }

  onCancelBooking(bookedListing: BookedListing): void {
    bookedListing.loading = true;
    this.bookingService.cancel(bookedListing.bookingPublicId, bookedListing.listingPublicId);
  }
}
