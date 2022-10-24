import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { faList, faClapperboard, faRotate, faHandSparkles, faTrashCan, faBomb, faArrowUpShortWide } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorBufferComponent } from '../modals/error-buffer/error-buffer.component';
import { UnsortedComponent } from '../modals/unsorted/unsorted.component';
import { RulesListComponent } from '../modals/rules-list/rules-list.component';
import { Store } from '@ngrx/store';
import { selectHistoryState } from '../state/selectors/history.selectors';
import { SortProgressComponent } from '../modals/sort-progress/sort-progress.component';
import { selectRemoteMode } from '../state/selectors/remote.selectors';
import { disconnect, initializeSocketConnection } from '../state/actions/remote.actions';

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
  remoteMode = false;
  viewerMode = false;
  mode = '';

  @Output() onPlaylistsClicked: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private modalService: NgbModal,
    private store: Store
  ) { }

  ngOnInit(): void {
    this.store.select(selectHistoryState).subscribe(h => {
      this.errorCount = h.errorQueue.length;
      this.unsortedCount = h.unsorted.length;
    });
    this.store.select(selectRemoteMode).subscribe(m => this.mode = m);
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
    const modalRef = this.modalService.open(SortProgressComponent, { size: 'xl', scrollable: true });
  }

  sync(e:any){
    console.log('sync');
    if(e.target.id === 'viewerToggle' && e.target.checked) {
      console.log('dispatching init for viewer');
      this.store.dispatch(initializeSocketConnection({clientType: 'viewer' }));
      this.remoteMode = false;
    } else if(e.target.checked) {
      console.log('dispatching init for remote');
      this.store.dispatch(initializeSocketConnection({clientType: 'remote' }));
      this.viewerMode = false;
    } else if (e.target.id === 'viewerToggle') {
      console.log('dispatching viewer disconnect');
      this.store.dispatch(disconnect({ clientType: 'viewer' }));
    } else {
      console.log('dispatching remote disconnect');
      this.store.dispatch(disconnect({ clientType: 'remote' }));
    }
  }

}
