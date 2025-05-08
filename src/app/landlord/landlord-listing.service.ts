import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { State } from '../core/model/state.mode';
import { CreatedListing, newListing } from './model/listing.model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class LandlordListingService {
  public http = inject(HttpClient);

  private create$: WritableSignal<State<CreatedListing>> = signal(State.Builder<CreatedListing>().forInit());
  public createSig = computed(() => this.create$());

  constructor() {}

  public create(newListing: newListing): void {
    const formData = new FormData();
    for (let i = 0; i < newListing.pictures.length; i++) {
      formData.append('picture-' + i, newListing.pictures[i].file);
    }

    const clone = structuredClone(newListing);
    clone.pictures = []; // to avoid serializing pictures
    formData.append('dto', JSON.stringify(newListing));
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
}
