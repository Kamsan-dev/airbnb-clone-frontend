import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { createPaginationOption, Page, Pagination } from '../core/model/request.model';
import { State } from '../core/model/state.mode';
import { DisplayCardListing } from '../landlord/model/listing.model';
import { CategoryName } from '../layout/category/category.model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class TenantListingService {
  public http = inject(HttpClient);

  private getAllByCategory$: WritableSignal<State<Page<DisplayCardListing>>> = signal(State.Builder<Page<DisplayCardListing>>().forInit());
  public getAllByCategorySig = computed(() => this.getAllByCategory$());

  getAllByCategory(pageRequest: Pagination, category: CategoryName): void {
    let params = createPaginationOption(pageRequest);
    params = params.set('category', category);
    this.http.get<Page<DisplayCardListing>>(`${environment.API_URL}/tenant-listing/get-all-by-category`, { params }).subscribe({
      next: (listings: Page<DisplayCardListing>) => {
        this.getAllByCategory$.set(State.Builder<Page<DisplayCardListing>>().forSuccess(listings));
      },
      error: (error: HttpErrorResponse) => {
        this.getAllByCategory$.set(State.Builder<Page<DisplayCardListing>>().forError(error));
      },
    });
  }

  resetAllByCategory(): void {
    this.getAllByCategory$.set(State.Builder<Page<DisplayCardListing>>().forInit());
  }

  constructor() {}
}
