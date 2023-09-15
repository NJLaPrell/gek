import { Injectable, TemplateRef } from '@angular/core';

const FAIL_DELAY = 5000;
const SUCCESS_DELAY = 2000;
const INFO_DELAY = 5000;

const FAIL_OPTIONS = { classname: 'bg-danger text-light', delay: FAIL_DELAY /*, header: 'Error!'*/ };
const SUCCESS_OPTIONS_OPTIONS = { classname: 'bg-success text-light', delay: SUCCESS_DELAY /*, header: 'Success!'*/ };
const INFO_OPTIONS = { classname: 'bg-info text-dark', delay: INFO_DELAY };

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: any[] = [];

  show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTpl, ...options });
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  clear() {
    this.toasts.splice(0, this.toasts.length);
  }

  fail(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTpl, ...FAIL_OPTIONS, ...options });
  }

  success(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTpl, ...SUCCESS_OPTIONS_OPTIONS, ...options });
  }

  info(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTpl, ...INFO_OPTIONS, ...options });
  }
}
