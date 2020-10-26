import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { environment } from '@env/environment';
// Services
import { Logger } from '@services/logger/logger.service';
import { NotificationService } from '@core/error/notification-service';
import { ERROR_CONTEXTS } from '@core/constants/application-data.constants';
import { UserSessionStateModel } from '@core/models/user-session-state.model';

import * as fromUserSessionActions from '@stores/user-session/user-session.actions';
import * as fromUserSessionSelectors from '@stores/user-session/user-session.selectors';

import { Subscription } from 'rxjs';
import { AuthenticationService } from '@services/authentication/authentication.service';
import { finalize } from 'rxjs/operators';

const log = new Logger('Register');

@Component({
  selector: 'blo-app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {

  public userSession$: Subscription;
  public registerForm: FormGroup;
  public successfulRequest: boolean;
  public notifierUserSession$: Subscription;
  public error;


  constructor(private router: Router,
              private store: Store<UserSessionStateModel>,
              private authenticationService: AuthenticationService,
              private formBuilder: FormBuilder,
              private notificationService: NotificationService) {
    this.createForm();
    this.successfulRequest = false;
  }

  public ngOnInit() {
    this.notifierUserSession$ = this.notificationService.getSubscription(ERROR_CONTEXTS.GLOBAL, (error) => this.error = error );
    this.userSession$ = this.store.select(fromUserSessionSelectors.getUserSession).subscribe(userSession => {
      if ((userSession.accessTokenExpiration) && (userSession.accessTokenExpiration.getTime() > new Date().getTime())) {
        this.router.navigate(['/api-keys'], { replaceUrl: true });
      }
    });
  }

  public ngOnDestroy() {
    this.userSession$.unsubscribe();
    this.notifierUserSession$.unsubscribe();
  }

  public register() {
   this.authenticationService.register(this.registerForm.value)
    .pipe(finalize(() => {
      log.debug('Register request finalized');
    }))
    .subscribe( resp => {
        // resultado OK
        log.debug(resp);
        this.successfulRequest = true;
      });
  }

  private createForm() {
    this.registerForm = this.formBuilder.group({
      firstName: [''],
      lastName: [''],
      email: [''],
    });
  }

}
