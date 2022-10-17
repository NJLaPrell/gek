import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Video } from 'src/app/state/models/video.model';
import { selectUnsorted } from 'src/app/state/selectors/history.selectors';
import * as moment from 'moment';
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { purgeUnsorted } from 'src/app/state/actions/history.actions';

@Component({
  selector: 'app-unsorted',
  templateUrl: './unsorted.component.html',
  styleUrls: ['./unsorted.component.scss']
})
export class UnsortedComponent implements OnInit {
  unsorted: Video[] = [];
  moment = moment;
  faTrash = faTrash;

  constructor(
    public activeModal: NgbActiveModal,
    private store: Store
  ) { }

  ngOnInit(): void {
    this.store.select(selectUnsorted).subscribe(u => this.unsorted = u);
  }

  purge() {
    console.log('purge');
    this.store.dispatch(purgeUnsorted());
  }

}
