import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  faList, faClapperboard, faRotate, faHandSparkles, faTrashCan,
  faBomb, faArrowUpShortWide, faUserGear
} from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorBufferComponent } from '../modals/error-buffer/error-buffer.component';
import { UnsortedComponent } from '../modals/unsorted/unsorted.component';
import { RulesListComponent } from '../modals/rules-list/rules-list.component';
import { Store } from '@ngrx/store';
import { selectHistoryState } from '../state/selectors/history.selectors';
import { SortProgressComponent } from '../modals/sort-progress/sort-progress.component';
import { selectRemoteMode, selectPeerConnected, selectConnected } from '../state/selectors/remote.selectors';
import { disconnect, initializeSocketConnection } from '../state/actions/remote.actions';
import { getRules } from '../state/actions/rules.actions';
import { getHistory } from '../state/actions/history.actions';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';
import { PreferencesComponent } from '../modals/preferences/preferences.component';
import { environment } from '../../environments/environment';
import { selectUserId } from '../state/selectors/auth.selectors';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent {
  faList = faList;
  faClapperboard = faClapperboard;
  faRotate = faRotate;
  faHandSparkles = faHandSparkles;
  faTrashCan = faTrashCan;
  faBomb = faBomb;
  faArrowUpShortWide = faArrowUpShortWide;
  faUserGear = faUserGear;

  errorCount = 0;
  unsortedCount = 0;
  remoteMode = false;
  viewerMode = false;
  mode = '';
  waitingPeerReconnect = false;
  private peerConnected = false;
  private selfConnected = false;
  private userId!: string | false;

  environment = environment;

  @Input() authenticated = false;

  @Output() onPlaylistsClicked: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private modalService: NgbModal,
    private store: Store,
    private router: Router
  ) {
    this.store.select(selectUserId).subscribe(uid => this.userId = uid);
    this.store.select(selectHistoryState).subscribe(h => {
      this.errorCount = h.errorQueue.length;
      this.unsortedCount = h.unsorted.length;
    });
    this.store.select(selectRemoteMode).subscribe(m => this.mode = m);
    this.store.select(selectPeerConnected).subscribe(c => {
      this.waitingPeerReconnect = this.peerConnected && this.selfConnected && !c;
      this.peerConnected = c;
    });
    this.store.select(selectConnected).subscribe(c => {
      this.waitingPeerReconnect = this.peerConnected && this.selfConnected && !c;
      this.selfConnected = c;
    });
  }

  togglePlaylists() {
    this.onPlaylistsClicked.emit();
  }

  openErrorBuffer() {
    this.modalService.open(ErrorBufferComponent, { size: 'xl', scrollable: true });
  }

  openUnsorted() {
    this.modalService.open(UnsortedComponent, { size: 'xl', scrollable: true });
  }

  openRules() {
    this.modalService.open(RulesListComponent, { size: 'xl', scrollable: true });
  }

  openPreferences() {
    this.modalService.open(PreferencesComponent, { size: 'xl', scrollable: true });
  }

  sortVideos() {
    this.modalService.open(SortProgressComponent, { size: 'xl', scrollable: true });
  }

  home() {
    this.router.navigate(['/']);
  }

  handleModeToggle(e:any){
    if (!this.userId) {
      console.error('No userId is set. Unable to initialize socket connection without a userId.');
      return;
    }
    if(e.target.id === 'viewerToggle' && e.target.checked) {
      this.store.dispatch(initializeSocketConnection({ clientType: 'viewer', userId: this.userId }));
      this.remoteMode = false;
    } else if(e.target.checked) {
      this.store.dispatch(initializeSocketConnection({ clientType: 'remote', userId: this.userId }));
      this.viewerMode = false;
    } else if (e.target.id === 'viewerToggle') {
      this.store.dispatch(disconnect());
      this.home();
    } else {
      this.store.dispatch(disconnect());
      this.home();
    }
  }

}
