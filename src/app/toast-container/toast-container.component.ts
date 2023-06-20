import { Component, TemplateRef } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <ngb-toast
      *ngFor="let toast of toastService.toasts"
      [class]="toast.classname + ' toast-container'"
      [autohide]="true"
      (mouseenter)="toast.autohide = false"
      (mouseleave)="toast.autohide = true"
      [delay]="toast.delay || 5000"
      (hidden)="toastService.remove(toast)"
      [header]="toast.header"
      [animation]="true">
      <ng-template [ngIf]="isTemplate(toast)" [ngIfElse]="text">
        <div class="row">
          <div class="col">
            <ng-template [ngTemplateOutlet]="toast.textOrTpl"></ng-template>
          </div>
          <div class="col-md-auto">
            <button class="btn-close" (click)="toastService.remove(toast)"></button>
          </div>
        </div>
      </ng-template>

      <ng-template #text>
        <div class="row">
          <div class="col">
            {{ toast.textOrTpl }}
          </div>
          <div class="col-md-auto">
            <button class="btn-close" (click)="toastService.remove(toast)"></button>
          </div>
        </div>
      </ng-template>
    </ngb-toast>
  `,
  styleUrls: ['./toast-container.component.scss'],
  host: { class: 'toast-container position-fixed top-0 end-0 p-3', style: 'z-index: 1200' },
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}

  isTemplate(toast: any) {
    return toast.textOrTpl instanceof TemplateRef;
  }
}
