import { ChangeDetectionStrategy, Component, EventEmitter, inject, input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { InputTextModule } from 'primeng/inputtext';
import { PriceVo } from '../../../model/listing-vo.model';
import { debounceTime, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-price-step',
  standalone: true,
  imports: [FontAwesomeModule, InputTextModule, ReactiveFormsModule],
  templateUrl: './price-step.component.html',
  styleUrl: './price-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriceStepComponent implements OnInit, OnDestroy {
  price = input.required<PriceVo>();

  @Output()
  priceChange = new EventEmitter<PriceVo>();

  @Output()
  stepValidityChange = new EventEmitter<boolean>();

  formPrice!: FormGroup;
  private formBuilder = inject(FormBuilder);

  private destroy: Subject<void> = new Subject<void>();

  public ngOnInit(): void {
    this.formPrice = this.formBuilder.group({
      price: [
        this.price().value,
        [
          Validators.required,
          Validators.pattern(/^[0-9]\d*$/),
          Validators.min(0.01), // must be greater than 0
        ],
      ],
    });

    this.onFormsChange();
  }

  private onFormsChange(): void {
    this.formPrice?.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy)).subscribe(() => {
      this.price().value = this.formPrice!.get('price')?.value;
    });
    this.priceChange.emit(this.price());

    this.formPrice.statusChanges.pipe(takeUntil(this.destroy)).subscribe(() => {
      this.stepValidityChange.emit(this.formPrice.valid);
    });
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
