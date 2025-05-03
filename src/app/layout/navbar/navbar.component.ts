import { Component, inject, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { CategoryComponent } from '../category/category.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { DialogService } from 'primeng/dynamicdialog';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { ToastService } from '../toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  providers: [DialogService],
  imports: [ButtonModule, FontAwesomeModule, ToolbarModule, CategoryComponent, AvatarComponent, RouterModule, MenuModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  public location: string = 'Anywhere';
  public guests: string = 'Add guests';
  public dates: string = 'Any week';

  private toastService: ToastService = inject(ToastService);

  public currentMenuItems: MenuItem[] | undefined = [];

  public ngOnInit(): void {
    this.currentMenuItems = this.loadMenu();
    this.toastService.send({ severity: 'info', summary: 'Welcome to Airbnb App !' });
  }

  private loadMenu(): any {
    return [
      {
        label: 'Sign up',
        styleClass: 'font-bold',
      },
      {
        label: 'Log in',
      },
    ];
  }
}
