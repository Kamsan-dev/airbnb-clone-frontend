import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { NewListingPicture } from '../../../model/picture.model';

@Component({
  selector: 'app-picture-step',
  standalone: true,
  imports: [FontAwesomeModule, InputTextModule, ButtonModule],
  templateUrl: './picture-step.component.html',
  styleUrl: './picture-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PictureStepComponent {
  pictures = input.required<Array<NewListingPicture>>();

  @Output()
  pictureChange = new EventEmitter<Array<NewListingPicture>>();

  @Output()
  stepValidityChange = new EventEmitter<boolean>();

  onUploadNewPicture(target: EventTarget | null): void {
    const pictureFileList = this.extractFileFromTarget(target);
    if (pictureFileList != null) {
      for (let i = 0; i < pictureFileList.length; i++) {
        const picture = pictureFileList.item(i);
        if (picture != null) {
          const newPicture: NewListingPicture = {
            file: picture,
            urlDisplay: URL.createObjectURL(picture),
          };

          this.pictures().push(newPicture);
        }
      }
    }
    this.pictureChange.emit(this.pictures());
    this.stepValidityChange.emit(this.isPicturesValid());
  }

  onTrashPicture(picture: NewListingPicture) {
    const index = this.pictures().findIndex((file) => file.file.name === picture.file.name);
    this.pictures().splice(index, 1);
    this.pictureChange.emit(this.pictures());
    this.stepValidityChange.emit(this.isPicturesValid());
  }

  private extractFileFromTarget(target: EventTarget | null) {
    const htmlInputTarget = target as HTMLInputElement;
    if (target === null || htmlInputTarget.files === null) {
      return null;
    }

    return htmlInputTarget.files;
  }

  private isPicturesValid(): boolean {
    return this.pictures().length >= 5 ? true : false;
  }
}
