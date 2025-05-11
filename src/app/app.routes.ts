import { Routes } from '@angular/router';
import { authorityRouteAccess } from './core/authority-route-access.guard';

export const routes: Routes = [
  {
    path: 'landlord/properties',
    loadComponent: () => import('./landlord/list-properties/list-properties.component').then((m) => m.ListPropertiesComponent),
    canActivate: [authorityRouteAccess],
    data: {
      authorities: ['ROLE_LANDLORD'],
    },
  },
];
