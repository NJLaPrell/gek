import { createAction, props } from '@ngrx/store';
import { HistoryState } from '../models/history.model';

export const getHistory = createAction(
  '[History] Get History'
);

export const getHistorySuccess = createAction(
    '[History] Get History Success',
    props<{ response: HistoryState }>()
);

export const getHistoryFail = createAction(
    '[History] Get History Fail',
    props<{ error: string }>()
);

export const purgeUnsorted = createAction(
    '[History] Purge Unsorted'
);

export const purgeUnsortedSuccess = createAction(
    '[History] Purge Unsorted Success'
);

export const purgeUnsortedFail = createAction(
    '[History] Purge Unsorted Fail',
    props<{ error: string }>()
);
