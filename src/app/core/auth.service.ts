import { Location } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { State } from './model/state.mode';
import { User } from './model/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public http = inject(HttpClient);

  public location = inject(Location);

  public notConnected = 'NOT_CONNECTED';

  private fetchUser$: WritableSignal<State<User>> = signal(State.Builder<User>().forSuccess({ email: this.notConnected }));
  public fetchUser = computed(() => this.fetchUser$());

  /* Get info of the authenticated user */
  public fetchUserData(forceResync: boolean): void {
    this.fetchHttpUser(forceResync).subscribe({
      next: (user: User) => this.fetchUser$.set(State.Builder<User>().forSuccess(user)),
      error: (error: HttpErrorResponse) => {
        // 401 status code : unauthenticated
        if (error.status === HttpStatusCode.Unauthorized && this.isAuthenticated()) {
          this.fetchUser$.set(State.Builder<User>().forSuccess({ email: this.notConnected }));
        } else {
          this.fetchUser$.set(State.Builder<User>().forError(error));
        }
      },
    });
  }

  public login(): void {
    location.href = `${location.origin}${this.location.prepareExternalUrl('oauth2/authorization/okta')}`;
  }

  public logout(): void {
    this.http.post(`${environment.API_URL}/auth/logout`, {}).subscribe({
      next: (response: any) => {
        this.fetchUser$.set(State.Builder<User>().forSuccess({ email: this.notConnected }));
        location.href = response.logoutUrl;
      },
    });
  }

  public isAuthenticated(): boolean {
    if (this.fetchUser$().value) {
      return this.fetchUser$().value!.email !== this.notConnected;
    } else return false;
  }

  public hasAnyAuthority(authorities: string[] | string): boolean {
    if (this.fetchUser$().value!.email === this.notConnected) {
      return false;
    }
    if (!Array.isArray(authorities)) {
      authorities = [authorities];
    }
    return this.fetchUser$().value!.authorities!.some((authority: string) => authorities.includes(authority));
  }

  /** HTTP CALLS  **/

  public fetchHttpUser(forceResync: boolean): Observable<User> {
    return this.http.get<User>(`${environment.API_URL}/auth/get-authenticated-user?forceResync=${forceResync}`);
  }
}
