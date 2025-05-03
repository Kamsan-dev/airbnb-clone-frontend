import { CommonModule } from '@angular/common';
import { Component, input, InputSignal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  public imageUrl: InputSignal<string | undefined> = input<string>();
  public avatarSize: InputSignal<'avatar-sm' | 'avatar-xl'> = input<'avatar-sm' | 'avatar-xl'>('avatar-sm');
}
