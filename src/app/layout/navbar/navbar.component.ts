import { ChangeDetectionStrategy, Component, effect, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { ToolbarModule } from 'primeng/toolbar';
import { AuthService } from '../../core/auth.service';
import { User } from '../../core/model/user.model';
import { PropertiesCreateComponent } from '../../landlord/properties-create/properties-create.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { CategoryComponent } from '../category/category.component';
import { ToastService } from '../toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  providers: [DialogService],
  imports: [ButtonModule, FontAwesomeModule, ToolbarModule, CategoryComponent, AvatarComponent, RouterModule, MenuModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {
  public location: string = 'Anywhere';
  public guests: string = 'Add guests';
  public dates: string = 'Any week';

  public authService = inject(AuthService);
  public dialogService = inject(DialogService);
  public ref: DynamicDialogRef | undefined;

  public currentMenuItems: MenuItem[] | undefined = [];
  public user: User = { email: this.authService.notConnected };

  private login = () => this.authService.login();
  private logout = () => this.authService.logout();

  private constructor() {
    effect(() => {
      if (this.authService.fetchUser().status === 'OK') {
        this.user = this.authService.fetchUser().value!;
        this.currentMenuItems = this.loadMenu();
      }
    });
  }

  public ngOnInit(): void {
    this.authService.fetchUserData(false);
  }

  private loadMenu(): any {
    if (this.authService.isAuthenticated()) {
      return [
        {
          label: 'My properties',
          routerLink: 'landlord/properties',
          visible: this.hasToBeLandlord(),
        },
        {
          label: 'My booking',
          routerLink: 'booking',
        },
        {
          label: 'My reservation',
          routerLink: 'landlord/reservation',
          visible: this.hasToBeLandlord(),
        },
        {
          label: 'Log out',
          command: this.logout,
        },
      ];
    }
    return [
      {
        label: 'Sign up',
        styleClass: 'font-bold',
        command: this.login,
      },
      {
        label: 'Log in',
        command: this.login,
      },
    ];
  }
  private hasToBeLandlord() {
    return this.authService.hasAnyAuthority(['ROLE_LANDLORD']);
  }

  //#region events

  public onOpenNewListing(event: MouseEvent | TouchEvent): void {
    event.stopImmediatePropagation();
    this.ref = this.dialogService.open(PropertiesCreateComponent, {
      width: '60%',
      header: 'Airbnb your home',
      closable: true,
      focusOnShow: true,
      modal: true,
      showHeader: true,
    });
  }
}
