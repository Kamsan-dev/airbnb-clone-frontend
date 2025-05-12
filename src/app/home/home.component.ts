import { ChangeDetectionStrategy, Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TenantListingService } from '../tenant/tenant-listing-service.service';
import { ToastService } from '../layout/toast.service';
import { CategoryService } from '../layout/category/category.service';
import { Pagination } from '../core/model/request.model';
import { DisplayCardListing } from '../landlord/model/listing.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Category } from '../layout/category/category.model';
import { CardListingComponent } from '../shared/components/card-listing/card-listing/card-listing.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

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

  constructor() {
    this.listenToGetAllCategory();
  }

  ngOnDestroy(): void {
    this.tenantListingService.resetAllByCategory();
    if (this.categoryServiceSub) {
      this.categoryServiceSub.unsubscribe();
    }
  }
  ngOnInit(): void {
    this.listenToChangeCategory();
  }
  private listenToChangeCategory() {
    this.categoryServiceSub = this.categoryService.changeCategoryObs.subscribe({
      next: (category: Category) => {
        this.tenantListingService.getAllByCategory(this.pageRequest, category.technicalName);
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
}
