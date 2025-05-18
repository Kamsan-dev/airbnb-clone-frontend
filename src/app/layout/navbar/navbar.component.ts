import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
import { SearchComponent } from '../../tenant/search/search/search.component';
import dayjs from 'dayjs';

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
  public location = signal('Anywhere');
  public guests = signal('Add guests');
  public dates = signal('Any week');

  public authService = inject(AuthService);
  public dialogService = inject(DialogService);
  public ref: DynamicDialogRef | undefined;
  public activatedRoute = inject(ActivatedRoute);

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
    this.extractInformationForSearch();
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

  openNewSearch(event: MouseEvent | TouchEvent): void {
    event.stopImmediatePropagation();
    this.ref = this.dialogService.open(SearchComponent, {
      width: '40%',
      header: 'Search',
      closable: true,
      focusOnShow: true,
      modal: true,
      showHeader: true,
    });
  }

  private extractInformationForSearch(): void {
    this.activatedRoute.queryParams.subscribe((params: any) => {
      if (params['location']) {
        this.location.set(params['location']);
        this.guests.set(params['guests'] + ' guests');
        this.dates.set(dayjs(params['startDate']).format('MMM-DD') + ' to ' + dayjs(params['endDate']).format('MMM-DD'));
      } else {
        this.location.set('Anywhere');
        this.guests.set('Add guests');
        this.dates.set('Any week');
      }
    });
  }
}
