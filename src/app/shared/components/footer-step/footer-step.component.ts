import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Step } from '../../../landlord/properties-create/step.model';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-footer-step',
  standalone: true,
  imports: [FontAwesomeModule, JsonPipe],
  templateUrl: './footer-step.component.html',
  styleUrl: './footer-step.component.scss',
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterStepComponent {
  public currentStep = input.required<Step>();
  public loading = input<boolean>(false);
  public isAllStepsValid = input<boolean>(false);
  public labelFinishedBtn = input<string>('Finish');

  @Output()
  public finish = new EventEmitter<boolean>();
  @Output()
  public previous = new EventEmitter<boolean>();
  @Output()
  public next = new EventEmitter<boolean>();

  onFinish(): void {
    this.finish.emit(true);
  }
  onNext(): void {
    this.next.emit(true);
  }
  onPrevious(): void {
    this.previous.emit(true);
  }
}
