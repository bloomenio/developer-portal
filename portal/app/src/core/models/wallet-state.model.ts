import { AppState } from '@core/core.state';

export interface WalletStateModel {
    active?: boolean;
    plugin?: boolean;
}

export interface State extends AppState {
    WalletStateModel: WalletStateModel;
}
