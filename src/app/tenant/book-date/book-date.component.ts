import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
import { CalendarModule } from 'primeng/calendar';
import { AuthService } from '../../core/auth.service';
import { Listing } from '../../landlord/model/listing.model';
import { ToastService } from '../../layout/toast.service';
import { BookedDatesDTOFromClient, newBookingListing } from '../model/booking.model';
import { BookingService } from '../service/booking.service';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-book-date',
  standalone: true,
  imports: [CalendarModule, CommonModule, FormsModule, MessageModule],
  templateUrl: './book-date.component.html',
  styleUrl: './book-date.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookDateComponent implements OnInit, OnDestroy {
  listing = input.required<Listing>();
  listingPublicId = input.required<string>();

  bookingService = inject(BookingService);
  toastService = inject(ToastService);
  authService = inject(AuthService);
  router = inject(Router);

  bookingDates = signal(new Array<Date>());
  bookedDates = signal(new Array<Date>());
  totalPrice = signal(0);
  minDate = new Date();

  constructor() {
    this.listenToCheckAvailableDates();
    this.listenToCreateBooking();
  }
  private listenToCreateBooking() {
    effect(() => {
      const createBookingState = this.bookingService.createBookingSig();
      if (createBookingState.status === 'OK') {
        this.toastService.send({
          severity: 'success',
          detail: 'Booking created successfully',
        });
        //this.router.navigate(['/booking']);
      } else if (createBookingState.status === 'ERROR') {
        this.toastService.send({
          severity: 'error',
          detail: 'Something went wrong when saving your booking',
        });
      }
    });
  }

  private listenToCheckAvailableDates(): void {
    effect(
      () => {
        const state = this.bookingService.checkAvailibilitySig();
        if (state.status === 'OK' && state.value) {
          this.bookedDates.set(this.mapBookedDateFromClientToDate(state.value));
        } else if (state.status === 'ERROR') {
          this.toastService.send({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong when fetching the not available dates',
          });
        }
      },
      { allowSignalWrites: true }
    );
  }
  private mapBookedDateFromClientToDate(bookedDatesDTOFromClients: Array<BookedDatesDTOFromClient>): Array<Date> {
    const bookedDates = new Array<Date>();
    for (let bookedDate of bookedDatesDTOFromClients) {
      bookedDates.push(...this.getDatesInRange(bookedDate));
    }
    return bookedDates;
  }

  private getDatesInRange(bookedDate: BookedDatesDTOFromClient) {
    const dates = new Array<Date>();

    let currentDate = bookedDate.startDate;
    while (currentDate <= bookedDate.endDate) {
      dates.push(currentDate.toDate());
      currentDate = currentDate.add(1, 'day');
    }

    return dates;
  }

  ngOnInit(): void {
    this.bookingService.checkAvailibility(this.listingPublicId());
  }

  onDateChange(newBookingDates: Array<Date>) {
    this.bookingDates.set(newBookingDates);
    if (this.validateMakeBooking()) {
      const startBookingDateDayJS = dayjs(newBookingDates[0]);
      const endBookingDateDayJS = dayjs(newBookingDates[1]);
      this.totalPrice.set(endBookingDateDayJS.diff(startBookingDateDayJS, 'days') * this.listing().price.value);
    } else {
      this.totalPrice.set(0);
    }
  }

  onBookingClick(event: MouseEvent | TouchEvent) {
    event.stopImmediatePropagation();
    const newBooking: newBookingListing = {
      startDate: this.bookingDates()[0],
      endDate: this.bookingDates()[1],
      listingPublicId: this.listingPublicId(),
    };
    this.bookingService.create(newBooking);
  }

  public validateMakeBooking = computed(() => {
    return (
      this.bookingDates().length === 2 &&
      this.bookingDates()[0] !== null &&
      this.bookingDates()[1] !== null &&
      this.bookingDates()[0].getDate() !== this.bookingDates()[1].getDate() &&
      this.authService.isAuthenticated()
    );
  });

  ngOnDestroy(): void {
    this.bookingService.resetCreate();
  }
}
