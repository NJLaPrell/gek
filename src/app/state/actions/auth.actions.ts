import { createAction, props } from '@ngrx/store';

export const login = createAction(
  '[Auth] Login'
);

export const loginSuccess = createAction(
    '[Auth] Login Success',
    props<{ code: string }>()
);

export const loginFail = createAction(
    '[Auth] Login Fail',
    props<{ error: string }>()
);

export const getToken = createAction(
    '[Auth] Get Auth Token',
    props<{ code: string }>()
);

export const getTokenSuccess = createAction(
    '[Auth] Get Auth Token Success'
);

export const getTokenFail = createAction(
    '[Auth] Get Auth Token Fail',
    props<{ error: string }>()
);