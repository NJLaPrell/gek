import { Component } from '@angular/core';
import { faHandshake } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.scss'],
})
export class LegalComponent {
  faHandshake = faHandshake;

  constructor(public activeModal: NgbActiveModal) {}

  login(): void {
    window.location.href = '/login';
  }
}
