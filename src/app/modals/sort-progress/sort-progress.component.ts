import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { getHistory } from 'src/app/state/actions/history.actions';
import { getRules } from 'src/app/state/actions/rules.actions';
import { getSubscriptions, getUncachedLists } from 'src/app/state/actions/list.actions';
import { SortService } from '../../services/sort.service';

@Component({
  selector: 'app-sort-progress',
  templateUrl: './sort-progress.component.html',
  styleUrls: ['./sort-progress.component.scss'],
})
export class SortProgressComponent {
  @ViewChild('jobOutput') private jobOutput!: ElementRef;
  output = '';

  constructor(
    public activeModal: NgbActiveModal,
    private sortService: SortService,
    private store: Store
  ) {
    this.sortService.runSortService().subscribe(response => {
      if (response.body) {
        const reader = response.body.getReader();
        return this.readChunk(reader);
      } else {
        return;
      }
    });
  }

  private readChunk = (reader: any) => {
    reader.read().then(({ done, value }: any) => {
      if (done) {
        this.reloadData();
        return;
      }
      this.output += new TextDecoder('utf-8').decode(value) + '\n';
      this.jobOutput.nativeElement.scrollTop = this.jobOutput.nativeElement.scrollHeight;
      return this.readChunk(reader);
    });
  };

  private reloadData = (): void => {
    this.store.dispatch(getUncachedLists());
    this.store.dispatch(getSubscriptions());
    this.store.dispatch(getRules());
    this.store.dispatch(getHistory());
  };
}
