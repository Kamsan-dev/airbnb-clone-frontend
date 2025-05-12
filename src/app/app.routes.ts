import { Routes } from '@angular/router';
import { authorityRouteAccess } from './core/authority-route-access.guard';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: 'landlord/properties',
    loadComponent: () => import('./landlord/list-properties/list-properties.component').then((m) => m.ListPropertiesComponent),
    canActivate: [authorityRouteAccess],
    data: {
      authorities: ['ROLE_LANDLORD'],
    },
  },
  {
    path: '',
    component: HomeComponent,
  },
];
