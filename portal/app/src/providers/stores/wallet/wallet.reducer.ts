import { WalletStateModel } from '@models/wallet-state.model';
import { WalletActionTypes, WalletActionActions } from './wallet.actions';
import { createEntityAdapter } from '@ngrx/entity';

export const walletInitialStateAdapter = createEntityAdapter<WalletStateModel>({
});

const walletInitialState: WalletStateModel = walletInitialStateAdapter.getInitialState({
    active: false,
    plugin: false
});

export function WalletReducer(state: WalletStateModel = walletInitialState, action: WalletActionActions): WalletStateModel {
    switch (action.type) {
        case WalletActionTypes.UPDATE_WALLET_SUCCESS:
        case WalletActionTypes.INIT_WALLET_SUCCESS:
            return { ...{}, ...state, ...action.payload };
        default:
            return state;
    }
}

export const isActive = (state: WalletStateModel) => state ? state.active : false;
export const hasPlugin = (state: WalletStateModel) => state ? state.plugin : false;
