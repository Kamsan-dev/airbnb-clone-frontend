import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-info-step-control',
  standalone: true,
  imports: [ButtonModule, CommonModule, FontAwesomeModule],
  templateUrl: './info-step-control.component.html',
  styleUrl: './info-step-control.component.scss',
})
export class InfoStepControlComponent {
  title = input.required<string>();
  value = input.required<number>();
  minValue = input<number>(0);

  @Output()
  valueChange = new EventEmitter<number>();

  separator = input<boolean>(true);

  onIncrement(): void {
    this.valueChange.emit(this.value() + 1);
  }

  onDecrement(): void {
    this.valueChange.emit(this.value() - 1);
  }
}
