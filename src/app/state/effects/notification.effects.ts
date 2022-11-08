import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs';
import * as HistoryActions from '../actions/history.actions';
import * as RulesActions from '../actions/rules.actions';
import * as VideoActions from '../actions/video.actions';
import * as ListActions from '../actions/list.actions';
import { ToastService } from 'src/app/services/toast.service';



const DELAY = 5000;

@Injectable()
export class NotificationEffects {

  fail$ = createEffect(() => 
    this.actions$.pipe(
      ofType(
        HistoryActions.purgeErrorBufferFail,
        HistoryActions.getHistoryFail,
        HistoryActions.purgeUnsortedFail,
        HistoryActions.deleteUnsortedItemFail,
        HistoryActions.deleteErrorItemFail,
        RulesActions.addRuleFail,
        RulesActions.deleteRuleFail,
        RulesActions.getRulesFail,
        RulesActions.updateRuleFail,
        VideoActions.getChannelVideosFail,
        VideoActions.getPlaylistVideosFail,
        VideoActions.addToPlaylistFail,
        VideoActions.rateVideoFail,
        VideoActions.removeFromPlaylistFail,
        ListActions.getListsFail
      ),
      tap((action) => {
        this.notifyFail(action.error);
      })
    ),
  { dispatch: false }
  );

  success$ = createEffect(() => 
    this.actions$.pipe(
      ofType(
        HistoryActions.purgeErrorBufferSuccess,
        HistoryActions.purgeUnsortedSuccess,
        HistoryActions.deleteUnsortedItemSuccess,
        HistoryActions.deleteErrorItemSuccess,
        RulesActions.addRuleSuccess,
        RulesActions.deleteRuleSuccess,
        RulesActions.updateRuleSuccess,
        VideoActions.addToPlaylistSuccess,
        VideoActions.rateVideoSuccess,
        VideoActions.removeFromPlaylistSuccess
      ),
      tap((action) => {
        this.notifySuccess(action.message);
      })
    ),
  { dispatch: false }
  );

  notifyFail(text: string) {
    this.notify(text, { classname: 'bg-danger text-light', delay: DELAY/*, header: 'Error!'*/ });
  }

  notifySuccess(text: string) {
    this.notify(text, { classname: 'bg-success text-light', delay: 2000/*, header: 'Success!'*/ });
  }

  notify(text: string, options = {}) {
    this.toast.show(text, options);
  }

  constructor(
        private actions$: Actions,
        public toast: ToastService
  ) { }
}