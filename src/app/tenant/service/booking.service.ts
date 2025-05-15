import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { State } from '../../core/model/state.mode';
import { BookedDatesDTOFromClient, BookedDatesDTOFromServer, BookedListing, newBookingListing } from '../model/booking.model';
import { environment } from '../../../environments/environment.development';
import { map } from 'rxjs';
import dayjs from 'dayjs';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private http = inject(HttpClient);

  private createBooking$: WritableSignal<State<boolean>> = signal(State.Builder<boolean>().forInit());
  public createBookingSig = computed(() => this.createBooking$());

  private checkAvailability$: WritableSignal<State<Array<BookedDatesDTOFromClient>>> = signal(State.Builder<Array<BookedDatesDTOFromClient>>().forInit());
  public checkAvailibilitySig = computed(() => this.checkAvailability$());

  private getBookedListing$: WritableSignal<State<Array<BookedListing>>> = signal(State.Builder<Array<BookedListing>>().forInit());
  public getBookedListingSig = computed(() => this.getBookedListing$());

  private cancel$: WritableSignal<State<string>> = signal(State.Builder<string>().forInit());
  public cancelSig = computed(() => this.cancel$());

  constructor() {}

  create(newBooking: newBookingListing): void {
    this.http.post<boolean>(`${environment.API_URL}/booking/create`, newBooking).subscribe({
      next: (response: boolean) => {
        this.createBooking$.set(State.Builder<boolean>().forSuccess(response));
      },
      error: (error: HttpErrorResponse) => {
        this.createBooking$.set(State.Builder<boolean>().forError(error));
      },
    });
  }

  resetCreate(): void {
    this.createBooking$.set(State.Builder<boolean>().forInit());
  }

  checkAvailibility(listingPublicId: string): void {
    const params = new HttpParams().set('listingPublicId', listingPublicId);
    this.http
      .get<Array<BookedDatesDTOFromServer>>(`${environment.API_URL}/booking/check-availability`, { params })
      .pipe(map((BookedDates) => this.mapDateToDayJS(BookedDates)))
      .subscribe({
        next: (BookedDates: Array<BookedDatesDTOFromClient>) => {
          this.checkAvailability$.set(State.Builder<Array<BookedDatesDTOFromClient>>().forSuccess(BookedDates));
        },
        error: (error: HttpErrorResponse) => {
          this.checkAvailability$.set(State.Builder<Array<BookedDatesDTOFromClient>>().forError(error));
        },
      });
  }
  private mapDateToDayJS(BookedDates: Array<BookedDatesDTOFromServer>): Array<BookedDatesDTOFromClient> {
    return BookedDates.map((dates) => ({
      ...dates,
      startDate: dayjs(dates.startDate),
      endDate: dayjs(dates.endDate),
    }));
  }

  getBookedListing(): void {
    this.http.get<Array<BookedListing>>(`${environment.API_URL}/booking/get-booked-listing`).subscribe({
      next: (response: Array<BookedListing>) => {
        this.getBookedListing$.set(State.Builder<Array<BookedListing>>().forSuccess(response));
      },
      error: (error: HttpErrorResponse) => {
        this.getBookedListing$.set(State.Builder<Array<BookedListing>>().forError(error));
      },
    });
  }

  cancel(bookingPublicId: string, listingPublicId: string): void {
    const params = new HttpParams().set('bookingPublicId', bookingPublicId).set('listingPublicId', listingPublicId);
    // .set("byLandlord", byLandlord);
    this.http.delete<string>(`${environment.API_URL}/booking/cancel`, { params }).subscribe({
      next: (canceledPublicId) => this.cancel$.set(State.Builder<string>().forSuccess(canceledPublicId)),
      error: (err) => this.cancel$.set(State.Builder<string>().forError(err)),
    });
  }

  resetCancel(): void {
    this.cancel$.set(State.Builder<string>().forInit());
  }
}
