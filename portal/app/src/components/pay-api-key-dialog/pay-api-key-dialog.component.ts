// Basic
import { Component, Inject, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSlideToggleChange } from '@angular/material';
import { Logger } from '@services/logger/logger.service';
import { Observable, Subscription, fromEvent, timer } from 'rxjs';
import { ContractModel } from '@core/models/contract.model';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { WalletStateModel } from '@core/models/wallet-state.model';
import * as fromSelectors from '@stores/wallet/wallet.selectors';
import { ApiKeysContract } from '@core/core.module';
import * as fromActions from '@stores/wallet/wallet.actions';
import { NotificationService } from '@core/error/notification-service';
import { ERROR_CONTEXTS } from '@core/constants/application-data.constants';

const log = new Logger('pay-api-key-dialog.component');

@Component({
  selector: 'blo-pay-api-key-dialog',
  templateUrl: 'pay-api-key-dialog.component.html',
  styleUrls: ['pay-api-key-dialog.component.scss']
})
export class PayApiKeyDialogComponent implements OnInit, OnDestroy {

  public payApiKeyForm: FormGroup;
  public value: number;
  public payQR: string;
  public metaMask$: Subscription;
  public notifierWallet$: Subscription;
  public metaMaskToggle = false;
  public metaMaskDisable = false;

  constructor(
    public dialogRef: MatDialogRef<PayApiKeyDialogComponent>,
    private store: Store<WalletStateModel>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) { }

  public ngOnInit() {
    this.payApiKeyForm = this.fb.group({
      name: [
        {
          value: this.data ? this.data.name : '',
          disabled: this.data ? this.data.id : false
        }
      ],
      description: [this.data ? this.data.description : '']
    });

    this.metaMask$ = this.store.select(fromSelectors.getWallet).subscribe((wallet) => {
      this.metaMaskToggle = wallet.active;
      this.metaMaskDisable = !wallet.plugin;
    });

    this.notifierWallet$ = this.notificationService.getSubscription(ERROR_CONTEXTS.WALLET, (error) => {
      console.log('Capture error');
      this.metaMaskToggle = false;
    } );

    this.onChange(1);
  }

  public ngOnDestroy() {
    this.metaMask$.unsubscribe();
    this.notifierWallet$.unsubscribe();
  }

  public onChange(newValue) {
    this.value = newValue;
    this.payQR = `raw://${ApiKeysContract.ADDRESS}#${newValue}#${encodeURI('Api Payment')}#${this.data.name}`;
  }

  public metaMaskChange(event: MatSlideToggleChange) {
    console.log('Toggle fired');
    if (event.checked) {
      this.store.dispatch(new fromActions.ActivateWallet());
    } else {
      this.store.dispatch(new fromActions.DeactivateWallet());
    }
  }

  public cancel() {
    this.dialogRef.close({status: false});
  }
  public redeem() {
    this.dialogRef.close({status: true, value: this.value, pay: false});
  }
  public pay() {
    this.dialogRef.close({status: true, value: this.value, pay: true});
  }


}
