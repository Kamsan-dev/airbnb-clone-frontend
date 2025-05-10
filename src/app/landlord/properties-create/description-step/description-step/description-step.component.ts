import { ChangeDetectionStrategy, Component, EventEmitter, inject, input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { Description } from '../../../model/listing.model';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  selector: 'app-description-step',
  standalone: true,
  imports: [InputTextModule, FormsModule, InputTextModule, ReactiveFormsModule, InputTextareaModule],
  templateUrl: './description-step.component.html',
  styleUrl: './description-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionStepComponent implements OnDestroy, OnInit {
  description = input.required<Description>();

  @Output()
  descriptionChange = new EventEmitter<Description>();

  @Output()
  stepValidityChange = new EventEmitter<boolean>();

  formDecription!: FormGroup;
  private formBuilder = inject(FormBuilder);

  private destroy: Subject<void> = new Subject<void>();

  constructor() {}
  public ngOnInit(): void {
    this.formDecription = this.formBuilder.group({
      title: [this.description().title.value, Validators.required],
      description: [this.description().description.value, Validators.required],
    });

    this.onFormsChange();
  }

  private onFormsChange(): void {
    this.formDecription?.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy)).subscribe(() => {
      this.description().title.value = this.formDecription!.get('title')?.value;
      this.description().description.value = this.formDecription!.get('description')?.value;
    });
    this.descriptionChange.emit(this.description());

    this.formDecription.statusChanges.pipe(takeUntil(this.destroy)).subscribe(() => {
      this.stepValidityChange.emit(this.formDecription.valid);
    });
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
