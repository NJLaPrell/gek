import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { getHistory } from 'src/app/state/actions/history.actions';
import { getRules } from 'src/app/state/actions/rules.actions';
import { getSubscriptions } from 'src/app/state/actions/list.actions';
import { SortService } from '../../services/sort.service';

@Component({
  selector: 'app-sort-progress',
  templateUrl: './sort-progress.component.html',
  styleUrls: ['./sort-progress.component.scss']
})
export class SortProgressComponent implements OnInit {
  output: string = '';
  constructor(
    public activeModal: NgbActiveModal,
    private sortService: SortService,
    private store: Store
  ) {
    //this.output$ = this.sortService.runSortService();
    this.sortService.runSortService().subscribe(r => r.text().then(v => {
      this.output = v;
      this.store.dispatch(getSubscriptions());
      this.store.dispatch(getRules());
      this.store.dispatch(getHistory());
    }));
  }
  //response.body.pipeThrough(new TextDecoderStream()).getReader();
  ngOnInit(): void {
    
  }

}
