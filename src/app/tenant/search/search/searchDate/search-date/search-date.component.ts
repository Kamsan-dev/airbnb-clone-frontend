import { ChangeDetectionStrategy, Component, effect, EventEmitter, input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { BookedDatesDTOFromServer } from '../../../../model/booking.model';

@Component({
  selector: 'app-search-date',
  standalone: true,
  imports: [CalendarModule, FormsModule],
  templateUrl: './search-date.component.html',
  styleUrl: './search-date.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchDateComponent {
  dates = input.required<BookedDatesDTOFromServer>();

  searchDateRaw = new Array<Date>();

  minDate = new Date();

  @Output()
  datesChange = new EventEmitter<BookedDatesDTOFromServer>();

  @Output()
  stepValidityChange = new EventEmitter<boolean>();

  constructor() {
    this.restorePreviousDate();
  }

  onDateChange(newBookingDate: Array<Date>): void {
    this.searchDateRaw = newBookingDate;
    this.stepValidityChange.emit(this.validateDateSearch());

    if (this.validateDateSearch()) {
      const searchDate: BookedDatesDTOFromServer = {
        startDate: this.searchDateRaw[0],
        endDate: this.searchDateRaw[1],
      };

      this.datesChange.emit(searchDate);
    }
  }

  public validateDateSearch(): boolean {
    return (
      this.searchDateRaw.length === 2 &&
      this.searchDateRaw[0] !== null &&
      this.searchDateRaw[1] !== null &&
      this.searchDateRaw[0].getDate() !== this.searchDateRaw[1].getDate()
    );
  }

  private restorePreviousDate(): void {
    effect(
      () => {
        if (this.dates()) {
          this.searchDateRaw[0] = this.dates().startDate;
          this.searchDateRaw[1] = this.dates().endDate;
        }
      },
      { allowSignalWrites: true }
    );
  }
}
