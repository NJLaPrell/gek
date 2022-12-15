import { Component } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { setPreferences } from 'src/app/state/actions/preferences.actions';
import { selectPreferences } from 'src/app/state/selectors/preferences.selectors';
import { faSave, faTrash, faArrowTurnUp } from '@fortawesome/free-solid-svg-icons';
import { PreferenceItem } from 'src/app/state/models/preferences.model';
import { ConfirmPromptComponent } from '../confirm-prompt/confirm-prompt.component';
import { ToastService } from 'src/app/services/toast.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { selectPlaylistTitles } from 'src/app/state/selectors/list.selectors';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent {
  // Font Awesome
  faSave = faSave;
  faTrash = faTrash;
  faArrowTurnUp = faArrowTurnUp;

  private preferences: PreferenceItem[] = [];
  
  public prefs: any;
  public playlists: any = [];

  constructor(
    private store: Store,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private toast: ToastService,
    private preferencesService: PreferencesService
  ) {
    this.store.select(selectPreferences).subscribe((prefs: PreferenceItem[]) => {
      this.preferences = [...prefs];
      this.prefs = {
        autoSort: this.getPref('autoSort'),
        autoSortInterval: Number.parseInt(String(this.getPref('autoSortInterval')) || '60000', 10)/60000,
        autoNext: this.getPref('autoNext'),
        almostDonePrompt: this.getPref('almostDonePrompt'),
        autoPlay: this.getPref('autoPlay'),
        keepPlaylist: this.getPref('keepPlaylist')
      };
    });

    this.store.select(selectPlaylistTitles).subscribe(pl => this.playlists = Object.keys(pl).map(plid => ({ id: plid, title: pl[plid] })).map(pl => ({ title: pl.title, id: pl.id })));
  }

  private getPref = (prefName: string) =>this.preferences.find((p: PreferenceItem) => p.name === prefName)?.value;
  
  savePreferences(): void {
    const prefs = [
      { name: 'autoSort', value: this.prefs.autoSort },
      { name: 'autoSortInterval', value: this.prefs.autoSortInterval * 60000 },
      { name: 'autoNext', value: this.prefs.autoNext },
      { name: 'almostDonePrompt', value: this.prefs.almostDonePrompt },
      { name: 'autoPlay', value: this.prefs.autoPlay },
      { name: 'keepPlaylist', value: this.prefs.keepPlaylist }
    ];
    this.store.dispatch(setPreferences({ lastUpdated: false, items: prefs }));
    this.activeModal.close();
  }

  confirmDelete() {
    const modalRef = this.modalService.open(ConfirmPromptComponent);
    modalRef.componentInstance.prompt = 'Deleting user data will permanently remove all of your data, including rules and unsorted videos. Are you sure you wish to continue?';
    modalRef.closed.subscribe(c => c === 'Continue click' ? this.delete() : null);
  }

  delete() {
    this.toast.info('Deleting User Data. Please wait...', { delay: 60000 });
    this.preferencesService.delete().subscribe(() => window.location.href='/logout?dataDeleted=true');
  }

  getKeepPlaylistName(): string {
    return this.playlists.find((pl: any) => pl.id === this.getPref('keepPlaylist'))?.title || 'None';
  }

  setKeepPlaylist(id: string) {
    console.log('setKeepPlaylist', id);
    this.prefs.keepPlaylist = id;
    const ix = this.preferences.findIndex(p => p.name === 'keepPlaylist');
    console.log(ix);
    if (ix === -1) {
      this.preferences.push({ name: 'keepPlaylist', value: id });
    } else {
      this.preferences[ix].value = id;
    }
  }

}
