import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { createPaginationOption, Page, Pagination } from '../core/model/request.model';
import { State } from '../core/model/state.mode';
import { DisplayCardListing, Listing } from '../landlord/model/listing.model';
import { CategoryName } from '../layout/category/category.model';
import { environment } from '../../environments/environment.development';
import { Subject } from 'rxjs';
import { Search } from './model/search.model';

@Injectable({
  providedIn: 'root',
})
export class TenantListingService {
  public http = inject(HttpClient);

  private getAllByCategory$: WritableSignal<State<Page<DisplayCardListing>>> = signal(State.Builder<Page<DisplayCardListing>>().forInit());
  public getAllByCategorySig = computed(() => this.getAllByCategory$());

  private search$: Subject<State<Page<DisplayCardListing>>> = new Subject();
  public searchObs = this.search$.asObservable();

  private getOne$: WritableSignal<State<Listing>> = signal(State.Builder<Listing>().forInit());
  public getOneSig = computed(() => this.getOne$());

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

  getOneByPublicId(publicId: string): void {
    const params = new HttpParams().set('publicId', publicId);
    this.http.get<Listing>(`${environment.API_URL}/tenant-listing/get-one`, { params }).subscribe({
      next: (listing: Listing) => {
        this.getOne$.set(State.Builder<Listing>().forSuccess(listing));
      },
      error: (error: HttpErrorResponse) => {
        this.getOne$.set(State.Builder<Listing>().forError(error));
      },
    });
  }

  resetGetOneByPublicId(): void {
    this.getOne$.set(State.Builder<Listing>().forInit());
  }

  searchListing(newSearch: Search, pageRequest: Pagination): void {
    let params = createPaginationOption(pageRequest);
    this.http.post<Page<DisplayCardListing>>(`${environment.API_URL}/tenant-listing/search`, newSearch, { params }).subscribe({
      next: (listings: Page<DisplayCardListing>) => {
        this.search$.next(State.Builder<Page<DisplayCardListing>>().forSuccess(listings));
      },
      error: (error: HttpErrorResponse) => {
        this.search$.next(State.Builder<Page<DisplayCardListing>>().forError(error));
      },
    });
  }
}
