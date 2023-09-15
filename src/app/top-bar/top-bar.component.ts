import { Component, Input } from '@angular/core';
import {
  faRocket,
  faRotate,
  faClipboardList,
  faTrashCan,
  faTriangleExclamation,
  faTableList,
  faUserGear,
  faSquareXmark,
  faTv,
  faTabletScreenButton,
  faRightFromBracket,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UnsortedComponent } from '../modals/unsorted/unsorted.component';
import { RulesListComponent } from '../modals/rules-list/rules-list.component';
import { LegalComponent } from '../modals/legal/legal.component';
import { Store } from '@ngrx/store';
import { selectHistoryState } from '../state/selectors/history.selectors';
import { SortProgressComponent } from '../modals/sort-progress/sort-progress.component';
import { selectRemoteMode, selectPeerConnected, selectConnected } from '../state/selectors/remote.selectors';
import { disconnect, initializeSocketConnection } from '../state/actions/remote.actions';
import { Router } from '@angular/router';
import { PreferencesComponent } from '../modals/preferences/preferences.component';
import { environment } from '../../environments/environment';
import { selectDisplayName, selectUserId } from '../state/selectors/auth.selectors';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent {
  // Font Awesome
  faRocket = faRocket;
  faRotate = faRotate;
  faClipboardList = faClipboardList;
  faTrashCan = faTrashCan;
  faTriangleExclamation = faTriangleExclamation;
  faTableList = faTableList;
  faUserGear = faUserGear;
  faSquareXmark = faSquareXmark;
  faTv = faTv;
  faTabletScreenButton = faTabletScreenButton;
  faRightFromBracket = faRightFromBracket;
  faUser = faUser;

  errorCount = 0;
  unsortedCount = 0;
  mode = '';
  waitingPeerReconnect = false;
  private peerConnected = false;
  private selfConnected = false;
  userId: string | false = false;

  environment = environment;
  displayName = '';

  @Input() authenticated = false;

  constructor(
    private modalService: NgbModal,
    private store: Store,
    private router: Router,
    private toast: ToastService
  ) {
    this.store.select(selectUserId).subscribe(uid => (this.userId = uid));
    this.store.select(selectHistoryState).subscribe(h => {
      this.errorCount = h.errorQueue.length;
      this.unsortedCount = h.unsorted.length;
    });
    this.store.select(selectRemoteMode).subscribe(m => (this.mode = m));
    this.store.select(selectPeerConnected).subscribe(c => {
      this.waitingPeerReconnect = this.peerConnected && this.selfConnected && !c;
      this.peerConnected = c;
    });
    this.store.select(selectConnected).subscribe(c => {
      this.waitingPeerReconnect = this.peerConnected && this.selfConnected && !c;
      this.selfConnected = c;
    });
    this.store.select(selectDisplayName).subscribe(n => (this.displayName = n));
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

  logout() {
    window.location.href = '/logout';
  }

  signin() {
    this.modalService.open(LegalComponent);
  }

  handleModeToggle(mode: 'player' | 'remote' | 'viewer') {
    if (!this.userId) {
      console.error('No userId is set. Unable to initialize socket connection without a userId.');
      return;
    }

    if (mode === 'player') {
      this.store.dispatch(disconnect());
      this.home();
    } else {
      this.store.dispatch(initializeSocketConnection({ clientType: mode, userId: this.userId }));
    }
  }
}
