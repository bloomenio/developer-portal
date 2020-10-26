// Basic
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromUserSessionActions from '@stores/user-session/user-session.actions';
import { UserSessionStateModel } from '@core/models/user-session-state.model';

@Component({
  selector: 'blo-menu',
  templateUrl: 'menu.component.html',
  styleUrls: ['menu.component.scss']
})
export class MenuComponent  {
  constructor(
    private store: Store<UserSessionStateModel>,
  ) {
  }

  public logout() {
    this.store.dispatch(new fromUserSessionActions.LogoutUserSession());
  }
}
