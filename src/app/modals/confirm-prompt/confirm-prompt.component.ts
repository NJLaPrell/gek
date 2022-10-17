import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-prompt',
  templateUrl: './confirm-prompt.component.html',
  styleUrls: ['./confirm-prompt.component.scss']
})
export class ConfirmPromptComponent implements OnInit {
  @Input() prompt = '';
  
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

}
