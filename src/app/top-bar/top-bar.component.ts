import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { faList, faClapperboard, faRotate, faHandSparkles, faTrashCan, faBomb, faArrowUpShortWide } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorBufferComponent } from '../modals/error-buffer/error-buffer.component';
import { UnsortedComponent } from '../modals/unsorted/unsorted.component';
import { RulesListComponent } from '../modals/rules-list/rules-list.component';
import { SortService } from '../services/sort.service';
import { Store } from '@ngrx/store';
import { getHistory } from '../state/actions/history.actions';
import { getPlaylists } from '../state/actions/playlist.actions';
import { getSubscriptions } from '../state/actions/subscriptions.actions';
import { selectHistoryState } from '../state/selectors/history.selectors';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {
  faList = faList;
  faClapperboard = faClapperboard;
  faRotate = faRotate;
  faHandSparkles = faHandSparkles;
  faTrashCan = faTrashCan;
  faBomb = faBomb;
  faArrowUpShortWide = faArrowUpShortWide;

  errorCount = 0;
  unsortedCount = 0;

  @Output() onPlaylistsClicked: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private modalService: NgbModal,
    private sortService: SortService,
    private store: Store
  ) { }

  ngOnInit(): void {
    this.store.select(selectHistoryState).subscribe(h => {
      this.errorCount = h.errorQueue.length;
      this.unsortedCount = h.unsorted.length;
    });
  }

  togglePlaylists() {
    this.onPlaylistsClicked.emit();
  }

  openErrorBuffer() {
    const modalRef = this.modalService.open(ErrorBufferComponent, { size: 'xl', scrollable: true });
  }

  openUnsorted() {
    const modalRef = this.modalService.open(UnsortedComponent, { size: 'xl', scrollable: true });
  }

  openRules() {
    const modalRef = this.modalService.open(RulesListComponent, { size: 'xl', scrollable: true });
  }

  sortVideos() {
    this.sortService.runSortService().pipe().subscribe(r => {
      this.store.dispatch(getHistory());
      this.store.dispatch(getPlaylists());
      this.store.dispatch(getSubscriptions());
    });
  }

}
