import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastService } from '../../layout/toast.service';
import { CardListingComponent } from '../../shared/components/card-listing/card-listing/card-listing.component';
import { LandlordListingService } from '../landlord-listing.service';
import { DisplayCardListing } from '../model/listing.model';

@Component({
  selector: 'app-list-properties',
  standalone: true,
  imports: [CardListingComponent, FontAwesomeModule, CommonModule],
  templateUrl: './list-properties.component.html',
  styleUrl: './list-properties.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListPropertiesComponent implements OnInit, OnDestroy {
  landlordListingService = inject(LandlordListingService);
  toastService = inject(ToastService);
  ref = inject(ChangeDetectorRef);

  listings: WritableSignal<Array<DisplayCardListing> | undefined> = signal([]);

  loadingDeletion: boolean = false;
  loadingFetchAll = signal(false);

  public constructor() {
    this.listenFetchAll();
    this.listenDeleteListing();
  }

  public ngOnInit(): void {
    this.fetchListings();
  }

  private listenFetchAll(): void {
    effect(
      () => {
        if (this.landlordListingService.getAllSig().status === 'OK' && this.landlordListingService.getAllSig().value) {
          this.listings.set(this.landlordListingService.getAllSig().value);
          this.loadingFetchAll.set(false);
        } else if (this.landlordListingService.getAllSig().status === 'ERROR') {
          this.toastService.send({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong when fetching the listing',
          });
        }
      },
      { allowSignalWrites: true }
    );
  }

  private listenDeleteListing(): void {
    effect(() => {
      const publicIdToDelete = this.landlordListingService.deleteSig();
      if (publicIdToDelete.status === 'OK' && publicIdToDelete.value) {
        const index = this.findIndexListingByPublicId(publicIdToDelete.value);
        this.listings()?.splice(index!, 1);
        this.toastService.send({
          severity: 'success',
          summary: 'Deleted successfully',
          detail: 'Listing has been deleted successfully',
        });
      } else if (publicIdToDelete.status === 'ERROR' && publicIdToDelete.value) {
        /* Cancel loading animation if we couldn't delete properly the listing */
        const index = this.findIndexListingByPublicId(publicIdToDelete.value);
        this.listings()![index!].loading = false;
        this.toastService.send({
          severity: 'error',
          summary: 'Error',
          detail: 'Something went wrong when deleting this listing',
        });
      }
      this.loadingDeletion = false;
      this.ref.detectChanges();
    });
  }

  private fetchListings() {
    this.loadingFetchAll.set(true);
    this.landlordListingService.getAll();
  }

  private findIndexListingByPublicId(publicId: string) {
    return this.listings()?.findIndex((listing) => listing.publicId === publicId);
  }

  onDeleteListing(listing: DisplayCardListing) {
    listing.loading = true; // put in loading the listing the user is trying to delete.
    this.landlordListingService.delete(listing.publicId);
  }

  public ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
  }
}
