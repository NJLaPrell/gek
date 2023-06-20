import { Component } from '@angular/core';
import { faTableList, faRocket, faClipboardList, faPlay, faTv } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RulesListComponent } from '../modals/rules-list/rules-list.component';
import { UnsortedComponent } from '../modals/unsorted/unsorted.component';
import { PreferencesComponent } from '../modals/preferences/preferences.component';
import { SortProgressComponent } from '../modals/sort-progress/sort-progress.component';
import { Store } from '@ngrx/store';
import { selectLists } from '../state/selectors/list.selectors';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  // Font Awesome
  faTableList = faTableList;
  faClipboardList = faClipboardList;
  faRocket = faRocket;
  faPlay = faPlay;
  faTv = faTv;

  firstPlaylistId = '';

  constructor(private modalService: NgbModal, private store: Store, private router: Router) {
    this.store
      .select(selectLists)
      .pipe()
      .subscribe(l => (this.firstPlaylistId = l[0]?.playlistId || ''));
  }

  openRules() {
    this.modalService.open(RulesListComponent, { size: 'xl', scrollable: true });
  }

  openUnsorted() {
    this.modalService.open(UnsortedComponent, { size: 'xl', scrollable: true });
  }

  openPreferences() {
    this.modalService.open(PreferencesComponent, { size: 'xl', scrollable: true });
  }

  sortVideos() {
    this.modalService.open(SortProgressComponent, { size: 'xl', scrollable: true });
  }

  watchNow() {
    this.router.navigate(['/', 'playlist', this.firstPlaylistId]);
  }
}
