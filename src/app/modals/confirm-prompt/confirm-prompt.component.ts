import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-prompt',
  templateUrl: './confirm-prompt.component.html',
  styleUrls: ['./confirm-prompt.component.scss']
})
export class ConfirmPromptComponent {
  @Input() prompt = '';
  
  constructor(public activeModal: NgbActiveModal) { }

}
