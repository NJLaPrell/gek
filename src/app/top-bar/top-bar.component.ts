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
import { getChannelVideos, getPlaylistVideos } from '../state/actions/video.actions';

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

  @Output() onPlaylistsClicked: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private modalService: NgbModal,
    private sortService: SortService,
    private store: Store
  ) { }

  ngOnInit(): void {
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
