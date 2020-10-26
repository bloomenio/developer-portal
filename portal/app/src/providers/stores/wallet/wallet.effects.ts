import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { of } from 'rxjs';

// Constants
import { mergeMap } from 'rxjs/operators';

// Actions
import * as fromActions from './wallet.actions';
import * as fromUserSessionActions from '@stores/user-session/user-session.actions';
import * as fromApplicationDataActions from '@stores/application-data/application-data.actions';

import { Logger } from '@services/logger/logger.service';
import { Web3Service } from '@services/web3/web3.service';
import { WalletStateModel } from '@core/models/wallet-state.model';
import { ERC223Contract, ApiKeysContract } from '@core/core.module';
import { TransactionService } from '@services/web3/transactions/transaction.service';
import { ERROR_CONTEXTS } from '@core/constants/application-data.constants';

const log = new Logger('wallet.effects');

@Injectable()
export class WalletEffects {

    constructor(
        private actions$: Actions<fromActions.WalletActionActions  | fromUserSessionActions.UserSessionActionActions>,
        private web3Service: Web3Service,
        private transactionService: TransactionService
    ) { }


    public initWallet = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.WalletActionTypes.INIT_WALLET),
            mergeMap(() => of(new fromActions.InitWalletSuccess({ active: false, plugin: this.web3Service.checkPlugin()})))
        )
    );

    public activateWallet = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.WalletActionTypes.ACTIVATE_WALLET),
            mergeMap(async () => {
                const wallet: WalletStateModel = { active: false};
                try {
                     if (await this.web3Service.activateWallet()) {
                        if (!this.web3Service.getContract(ERC223Contract.ADDRESS)) {
                            const myContract = this.web3Service.createContract(ERC223Contract.ABI, ERC223Contract.ADDRESS);
                            const erc223Contract = new ERC223Contract(ERC223Contract.ADDRESS, myContract, this.web3Service, this.transactionService);
                            this.web3Service.registerContract(ERC223Contract.ADDRESS, erc223Contract);
                        }
                        if (!this.web3Service.getContract(ApiKeysContract.ADDRESS)) {
                            const myContract = this.web3Service.createContract(ApiKeysContract.ABI, ApiKeysContract.ADDRESS);
                            const apiKeysContract = new ApiKeysContract(ApiKeysContract.ADDRESS, myContract, this.web3Service, this.transactionService);
                            this.web3Service.registerContract(ApiKeysContract.ADDRESS, apiKeysContract);
                        }
                        wallet.active = true;
                     } else {
                        return new fromApplicationDataActions.PopulateError('Metamask not found', ERROR_CONTEXTS.WALLET);
                     }
                } catch (error) {
                    return new fromApplicationDataActions.PopulateError(error, ERROR_CONTEXTS.WALLET);
                }
                return new fromActions.UpdateWalletSuccess(wallet);
            })
        )
    );

    public deactivateWallet = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.WalletActionTypes.DEACTIVATE_WALLET, fromUserSessionActions.UserSessionActionTypes.LOGOUT_USER_SESSION_SUCCESS),
            mergeMap(() => {
                this.web3Service.deactivateWallet();
                const wallet: WalletStateModel = { active: false};
                return of(new fromActions.UpdateWalletSuccess(wallet));
            })
        )
    );
}
