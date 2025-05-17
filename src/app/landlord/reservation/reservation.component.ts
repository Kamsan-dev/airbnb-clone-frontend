import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ToastService } from '../../layout/toast.service';
import { BookingService } from '../../tenant/service/booking.service';
import { BookedListing } from '../../tenant/model/booking.model';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { CardListingComponent } from '../../shared/components/card-listing/card-listing/card-listing.component';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CardListingComponent, FaIconComponent],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationComponent implements OnInit, OnDestroy {
  bookingService = inject(BookingService);
  toastService = inject(ToastService);
  ref = inject(ChangeDetectorRef);

  reservationListings = signal(new Array<BookedListing>());

  loading = signal(false);

  constructor() {
    this.listenToFetchReservation();
    this.listenToCancelReservation();
  }

  ngOnDestroy(): void {
    this.bookingService.resetCancel();
  }

  ngOnInit(): void {
    this.fetchReservation();
  }

  private fetchReservation() {
    this.loading.set(true);
    this.bookingService.getBookedListingForLandlord();
  }

  private listenToCancelReservation() {
    effect(
      () => {
        const cancelState = this.bookingService.cancelSig();
        if (cancelState.status === 'OK') {
          const listingToDeleteIndex = this.reservationListings().findIndex((listing) => listing.bookingPublicId === cancelState.value);
          this.reservationListings().splice(listingToDeleteIndex, 1);
          this.toastService.send({
            severity: 'success',
            summary: 'Successfully cancelled reservation',
          });
        } else if (cancelState.status === 'ERROR') {
          const listingToDeleteIndex = this.reservationListings().findIndex((listing) => listing.bookingPublicId === cancelState.value);
          this.reservationListings()[listingToDeleteIndex].loading = false;
          this.toastService.send({
            severity: 'error',
            summary: 'Error when canceling reservation',
          });
        }
        this.ref.detectChanges();
      },
      { allowSignalWrites: true }
    );
  }

  private listenToFetchReservation() {
    effect(
      () => {
        const reservedListingsState = this.bookingService.getBookedListingForLandlordSig();
        if (reservedListingsState.status === 'OK' && reservedListingsState.value) {
          this.loading.set(false);
          this.reservationListings.set(reservedListingsState.value);
        } else if (reservedListingsState.status === 'ERROR') {
          this.loading.set(false);
          this.toastService.send({
            severity: 'error',
            summary: 'Error when fetching the reservation',
          });
        }
      },
      { allowSignalWrites: true }
    );
  }

  onCancelReservation(reservation: BookedListing): void {
    reservation.loading = true;
    this.bookingService.cancel(reservation.bookingPublicId, reservation.listingPublicId, true);
  }
}
