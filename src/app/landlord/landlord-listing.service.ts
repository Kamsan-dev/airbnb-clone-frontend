import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { State } from '../core/model/state.mode';
import { CreatedListing, DisplayCardListing, newListing } from './model/listing.model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class LandlordListingService {
  public http = inject(HttpClient);

  private create$: WritableSignal<State<CreatedListing>> = signal(State.Builder<CreatedListing>().forInit());
  public createSig = computed(() => this.create$());

  private getAll$: WritableSignal<State<Array<DisplayCardListing>>> = signal(State.Builder<Array<DisplayCardListing>>().forInit());
  public getAllSig = computed(() => this.getAll$());

  private delete$: WritableSignal<State<string>> = signal(State.Builder<string>().forInit());
  public deleteSig = computed(() => this.delete$());

  constructor() {}

  public create(newListing: newListing): void {
    const formData = new FormData();
    for (let i = 0; i < newListing.pictures.length; i++) {
      formData.append('picture-' + i, newListing.pictures[i].file);
    }

    const clone = structuredClone(newListing);
    clone.pictures = []; // to avoid serializing pictures
    formData.append('dto', JSON.stringify(clone));
    this.http.post<CreatedListing>(`${environment.API_URL}/landlord-listing/create`, formData).subscribe({
      next: (response: CreatedListing) => {
        this.create$.set(State.Builder<CreatedListing>().forSuccess(response));
      },
      error: (error: HttpErrorResponse) => {
        this.create$.set(State.Builder<CreatedListing>().forError(error));
      },
    });
  }

  public resetListingCreation(): void {
    this.create$.set(State.Builder<CreatedListing>().forInit());
  }

  public getAll(): void {
    this.http.get<Array<DisplayCardListing>>(`${environment.API_URL}/landlord-listing/get-all`).subscribe({
      next: (listings: Array<DisplayCardListing>) => {
        this.getAll$.set(State.Builder<Array<DisplayCardListing>>().forSuccess(listings));
      },
      error: (error: HttpErrorResponse) => {
        this.getAll$.set(State.Builder<Array<DisplayCardListing>>().forError(error));
      },
    });
  }

  public delete(publicId: string): void {
    this.http.delete<string>(`${environment.API_URL}/landlord-listing/delete?publicId=${publicId}`).subscribe({
      next: (response: string) => {
        this.delete$.set(State.Builder<string>().forSuccess(response));
      },
      error: (error: HttpErrorResponse) => {
        this.delete$.set(State.Builder<string>().forError(error));
      },
    });
  }

  public resetDelete(): void {
    this.delete$.set(State.Builder<string>().forInit());
  }
}
