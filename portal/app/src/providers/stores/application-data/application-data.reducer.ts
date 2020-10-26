import { ApplicationDataStateModel } from '@models/application-data-state.model';
import { ApplicationDataActionTypes, ApplicationDataActions } from './application-data.actions';
import { createEntityAdapter } from '@ngrx/entity';

export const applicationDataAdapter = createEntityAdapter<ApplicationDataStateModel>({
});

const applicationDataInitialState: ApplicationDataStateModel = applicationDataAdapter.getInitialState({
    isFirstRun: false,
    theme: undefined
});

export function applicationDataReducer(state: ApplicationDataStateModel = applicationDataInitialState,
                                            action: ApplicationDataActions): ApplicationDataStateModel {
    switch (action.type) {
        case ApplicationDataActionTypes.CHANGE_FIRST_RUN:
        case ApplicationDataActionTypes.CHANGE_THEME:
            return { ...{}, ...state, ...action.payload, };

        default:
            return state;
    }
}

export const getIsFirstRun = (state: ApplicationDataStateModel) => state ? state.isFirstRun : undefined;

export const getTheme = (state: ApplicationDataStateModel) => state ? state.theme : undefined;
