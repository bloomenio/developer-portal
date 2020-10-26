// Basic
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Logger } from '@services/logger/logger.service';

import { FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

const log = new Logger('create-contract-dialog.component');


@Component({
  selector: 'blo-create-contract-dialog',
  templateUrl: 'create-contract-dialog.component.html',
  styleUrls: ['create-contract-dialog.component.scss']
})
export class CreateContractDialogComponent implements OnInit {

  public contractForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateContractDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translateService: TranslateService,
  ) { }

  public ngOnInit() {

    this.contractForm = new FormGroup({
      name: new FormControl({
        value: this.data ? this.data.name : '',
        disabled: this.data ? this.data.id : false
      }, [Validators.required, Validators.maxLength(60)]),
      description: new FormControl(this.data ? this.data.description : '', [Validators.required, Validators.maxLength(200)]),
      public: new FormControl(this.data ? this.data.public : false),
      address: new FormControl({
        value: this.data ? this.data.address : '',
        disabled: this.data ? this.data.id : false
      }, [Validators.required, this.addressValidator.bind(this)])
    });
  }

  public getErrorMessage(field) {
    // TODO: add translated error message
    const fieldForm = this.contractForm.get(field);
    return fieldForm.hasError('required') ? this.translateService.instant('common.error.required')  :
      fieldForm.hasError('notValidAddress') ? this.translateService.instant('common.error.not_valid_address') :
        '';
  }

  private addressValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value === undefined || ! this.isAddress(control.value)) {
        return { 'notValidAddress': true };
    }
    return null;
  }

  private isAddress (address) {
    if (/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        // check if it has the basic requirements of an address
        return true;
    } else {
      return false;
    }
  }

}
