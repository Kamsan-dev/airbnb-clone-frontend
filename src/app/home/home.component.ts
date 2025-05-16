import { ChangeDetectionStrategy, Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TenantListingService } from '../tenant/tenant-listing-service.service';
import { ToastService } from '../layout/toast.service';
import { CategoryService } from '../layout/category/category.service';
import { Pagination } from '../core/model/request.model';
import { DisplayCardListing } from '../landlord/model/listing.model';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { Category } from '../layout/category/category.model';
import { CardListingComponent } from '../shared/components/card-listing/card-listing/card-listing.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Search } from '../tenant/model/search.model';
import dayjs from 'dayjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CardListingComponent, FontAwesomeModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  tenantListingService = inject(TenantListingService);
  toastService = inject(ToastService);
  categoryService = inject(CategoryService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  pageRequest: Pagination = { size: 20, page: 0, sort: [] };
  loading = signal(false);
  listings = signal<Array<DisplayCardListing> | undefined>(undefined);

  categoryServiceSub: Subscription | undefined;

  private searchSubscription: Subscription | undefined;
  emptySearch = signal(false);
  searchIsLoading = signal(false);

  constructor() {
    this.listenToGetAllCategory();
    this.listenToSearch();
  }

  ngOnDestroy(): void {
    this.tenantListingService.resetAllByCategory();
    if (this.categoryServiceSub) {
      this.categoryServiceSub.unsubscribe();
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
  ngOnInit(): void {
    this.startNewSearch();
    this.listenToChangeCategory();
  }
  private listenToChangeCategory() {
    this.categoryServiceSub = this.categoryService.changeCategoryObs.subscribe({
      next: (category: Category) => {
        this.loading.set(true);
        if (!this.searchIsLoading()) {
          this.tenantListingService.getAllByCategory(this.pageRequest, category.technicalName);
        }
      },
    });
  }

  private listenToGetAllCategory(): void {
    effect(
      () => {
        const state = this.tenantListingService.getAllByCategorySig();
        if (state.status === 'OK' && state.value) {
          this.listings.set(state.value.content);
          this.loading.set(false);
        } else if (state.status === 'ERROR') {
          this.toastService.send({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong when fetching the listing',
          });
          this.loading.set(false);
        }
      },
      { allowSignalWrites: true }
    );
  }

  private startNewSearch(): void {
    this.activatedRoute.queryParams.pipe(filter((params) => params['location'])).subscribe({
      next: (params) => {
        this.loading.set(true);
        this.searchIsLoading.set(true);
        const newSearch: Search = {
          dates: {
            startDate: dayjs(params['startDate']).toDate(),
            endDate: dayjs(params['endDate']).toDate(),
          },
          infos: {
            guests: { value: params['guests'] },
            bedrooms: { value: params['bedrooms'] },
            beds: { value: params['beds'] },
            baths: { value: params['baths'] },
          },
          location: params['location'],
        };

        this.tenantListingService.searchListing(newSearch, this.pageRequest);
      },
    });
  }

  private listenToSearch() {
    this.searchSubscription = this.tenantListingService.searchObs.subscribe({
      next: (searchState) => {
        if (searchState.status === 'OK') {
          this.loading.set(false);
          this.searchIsLoading.set(false);
          this.listings.set(searchState.value?.content);
          this.emptySearch.set(this.listings()?.length === 0);
        } else if (searchState.status === 'ERROR') {
          this.loading.set(false);
          this.searchIsLoading.set(false);
          this.toastService.send({
            severity: 'error',
            summary: 'Error when search listing',
          });
        }
      },
    });
  }

  onResetSearchFilter() {
    this.router.navigate(['/'], {
      queryParams: { category: this.categoryService.getCategoryByDefault().technicalName },
    });
    this.loading.set(true);
    this.emptySearch.set(false);
  }
}
