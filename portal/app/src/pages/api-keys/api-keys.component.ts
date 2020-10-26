// Basic
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Logger } from '@services/logger/logger.service';
import { Store } from '@ngrx/store';
import { ApiKeyModel } from '@core/models/api-key.model';
import * as fromApiKeysActions from '@stores/api-keys/api-keys.actions';
import * as fromApiKeysSelectors from '@stores/api-keys/api-keys.selectors';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { GeneralDialogComponent } from '@components/general-dialog/general-dialog.component';
import { CreateApiKeyDialogComponent } from '@components/create-api-key-dialog/create-api-key-dialog.component';
import { PayApiKeyDialogComponent } from '@components/pay-api-key-dialog/pay-api-key-dialog.component';
import { TranslateService } from '@ngx-translate/core';

const log = new Logger('api-keys.component');

/**
 * Home page
 */
@Component({
  selector: 'blo-api-keys',
  templateUrl: './api-keys.component.html',
  styleUrls: ['./api-keys.component.scss']
})
export class ApiKeysComponent implements OnInit, OnDestroy {

  public apiKeyList$: Subscription;
  public warnApiKeyList: ApiKeyModel[];
  public normalApiKeyTupleList: ApiKeyModel[][];

  public searchEvent$: Subscription;

  @ViewChild('search', { static: false }) public search: ElementRef;

  constructor(
    private store: Store<ApiKeyModel>,
    private translateService: TranslateService,
    public dialog: MatDialog
  ) { }


  public ngOnInit() {
    this.normalApiKeyTupleList = [];
    this.apiKeyList$ = this.store.select(fromApiKeysSelectors.selectAll).subscribe(list => {
      this.normalApiKeyTupleList = [];
      this.warnApiKeyList = list.filter(item => this.getRemainingDays(item.expirationDate) <= 30);
      let tupleIdx = 0;
      list.filter(item => this.getRemainingDays(item.expirationDate) > 30).forEach(
        item => {
          if ( tupleIdx % 2 === 0) {
            this.normalApiKeyTupleList.push([]);
          }
          this.normalApiKeyTupleList[this.normalApiKeyTupleList.length - 1].push(item);
          tupleIdx++;
        }
      );
    });
    this.doSearch();
  }

  public ngOnDestroy() {
    this.apiKeyList$.unsubscribe();
  }

  public addApiKey() {
    const dialogRef = this.dialog.open(CreateApiKeyDialogComponent, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(new fromApiKeysActions.ApiKeyAdd({
          name: result.name,
          description: result.description,
          role: result.role,
          contracts: result.contracts
        }));
      }
    });
  }

  public async editApiKey(item) {
    const dialogRef = this.dialog.open(CreateApiKeyDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        id: item.id,
        name: item.name,
        description: item.description,
        role: item.role,
        contracts: item.contracts
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(new fromApiKeysActions.ApiKeyUpdate(item.id, {
          description: result.description,
          role: result.role,
          contracts: result.contracts
        }));
      }
    });
  }

  private doSearch(text = '') {
    this.store.dispatch(new fromApiKeysActions.ApiKeyQuery(text));
  }

  public deleteApiKey(item) {
    const dialogRef = this.dialog.open(GeneralDialogComponent, {
      width: '250px',
      height: '200px',
      data: {
        title: `${item.name}`,
        description: this.translateService.instant('apiKeys.delete_message'),
        buttonAccept: this.translateService.instant('common.accept'),
        buttonCancel: this.translateService.instant('common.cancel'),
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(new fromApiKeysActions.ApiKeyDelete(item.id));
        log.debug('deleteItem');
      }
    });
  }

  public getRemainingDays(dateString) {
    if (!dateString) {
      return 0;
    }
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const now = new Date();
    const date = new Date(dateString);
    const diffDays = Math.round(Math.abs((date.getTime() - now.getTime()) / oneDay));

    return (diffDays > 0) ? diffDays : 0;
  }

  public getFontSize(text) {
    text = String(text);
    let fontSize: number;
    switch (text.length) {
      case 1:
          fontSize = 70;
          break;
      case 2:
          fontSize = 60;
          break;
      case 3:
          fontSize = 50;
          break;
      default:
          fontSize = 30;
          break;
    }
    return fontSize;
  }

  public paymentApiKey(item) {
    const dialogRef = this.dialog.open(PayApiKeyDialogComponent, {
      width: '480px',
      height: '560px',
      data: {
        name: item.name,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.status) {
        // pay
        this.store.dispatch(new fromApiKeysActions.ApiKeyPay(item.name, item.id, result.pay ? result.value : undefined));
      }
    });
  }
}
