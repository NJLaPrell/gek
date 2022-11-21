import { Component } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ConfirmPromptComponent } from '../confirm-prompt/confirm-prompt.component';
import { selectErrorQueue } from 'src/app/state/selectors/history.selectors';
import { FailedVideo } from 'src/app/state/models/history.model';
import * as moment from 'moment';
import { faTrash, faRepeat } from '@fortawesome/free-solid-svg-icons';
import { purgeErrorBuffer } from 'src/app/state/actions/history.actions';

@Component({
  selector: 'app-error-buffer',
  templateUrl: './error-buffer.component.html',
  styleUrls: ['./error-buffer.component.scss']
})
export class ErrorBufferComponent {
  // Font Awesome
  faTrash = faTrash;
  faRepeat = faRepeat;

  errors: FailedVideo[] = [];
  moment = moment;
  
  constructor(
    public activeModal: NgbActiveModal,
    private store: Store,
    private modalService: NgbModal
  ) {
    this.store.select(selectErrorQueue).subscribe(e => this.errors = [...e].sort((a, b) => a.failDate > b.failDate ? 1 : -1));
  }

  confirmDelete() {
    const modalRef = this.modalService.open(ConfirmPromptComponent);
    modalRef.componentInstance.prompt = 'Are you sure you wish to purge the error buffer?';
    modalRef.closed.subscribe(c => c === 'Continue click' ? this.store.dispatch(purgeErrorBuffer()) : null);
  }

}
