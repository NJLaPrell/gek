import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Video } from 'src/app/state/models/video.model';
import { selectUnsorted } from 'src/app/state/selectors/history.selectors';
import * as moment from 'moment';
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { purgeUnsorted } from 'src/app/state/actions/history.actions';
import { ConfirmPromptComponent } from '../confirm-prompt/confirm-prompt.component';
import { selectPlaylists } from 'src/app/state/selectors/playlists.selectors';

@Component({
  selector: 'app-unsorted',
  templateUrl: './unsorted.component.html',
  styleUrls: ['./unsorted.component.scss']
})
export class UnsortedComponent implements OnInit {
  unsorted: Video[] = [];
  moment = moment;
  faTrash = faTrash;
  playlists: any = [];

  constructor(
    public activeModal: NgbActiveModal,
    private store: Store,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.store.select(selectUnsorted).subscribe(u => this.unsorted = [...u].sort((a, b) => new Date(a?.published || 0) > new Date(b?.published || 0) ? 1 : -1));
    this.store.select(selectPlaylists).subscribe(pl => this.playlists = [...pl.items].sort((a, b) => a.title.localeCompare(b.title)).map(pl => ({ title: pl.title, id: pl.id })))
  }

  purge() {
    const modalRef = this.modalService.open(ConfirmPromptComponent);
    modalRef.componentInstance.prompt = 'Are you sure you wish to purge the list of unsorted videos?';
    modalRef.closed.subscribe(c => c === 'Continue click' ? this.store.dispatch(purgeUnsorted()) : null);
  }

  getPlaylistTitle(id: string): string {
    return this.playlists.find((pl: any) => pl.id === id)?.title || 'Move to Playlist...';
  }

  moveToPlaylist(playlistId: string, itemId: string) {
    console.log(playlistId, itemId);
  }

  deleteItem(id: string) {
    console.log(id);
  }

 

}
