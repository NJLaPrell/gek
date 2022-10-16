import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-error-buffer',
  templateUrl: './error-buffer.component.html',
  styleUrls: ['./error-buffer.component.scss']
})
export class ErrorBufferComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

}
