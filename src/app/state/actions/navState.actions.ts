import { createAction, props } from '@ngrx/store';
import { NavStateProps } from '../models/navState.model';

export const getNavState = createAction('[NavState] Get Nav State');

export const setNavState = createAction('[NavState] Set Nav State', props<{ props: NavStateProps }>());
