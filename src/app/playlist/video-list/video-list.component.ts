import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { faArrowUpRightFromSquare, faEye, faTrash, faArrowTurnUp, faVault } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ConfirmPromptComponent } from 'src/app/modals/confirm-prompt/confirm-prompt.component';
import { ToastService } from 'src/app/services/toast.service';
import { addToPlaylist, removeFromPlaylist } from 'src/app/state/actions/video.actions';
import { Video } from 'src/app/state/models/video.model';
import { selectPlaylistTitles } from 'src/app/state/selectors/list.selectors';
import { selectKeepPlaylistPreference } from 'src/app/state/selectors/preferences.selectors';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.scss'],
})
export class VideoListComponent {
  // Fontawesome
  faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  faEye = faEye;
  faTrash = faTrash;
  faArrowTurnUp = faArrowTurnUp;
  faVault = faVault;

  @Input() playlistId = '';
  @Input() videoList: Video[] = [];

  playlists: any = [];
  keepPlaylist: string | false = false;

  constructor(
    private router: Router,
    private store: Store,
    private modalService: NgbModal,
    private toast: ToastService
  ) {
    this.store.select(selectPlaylistTitles).subscribe(
      pl =>
        (this.playlists = Object.keys(pl)
          .map(plid => ({ id: plid, title: pl[plid] }))
          .map(pl => ({ title: pl.title, id: pl.id })))
    );
    this.store.select(selectKeepPlaylistPreference).subscribe(p => (this.keepPlaylist = p));
  }

  videoClicked(videoId: string) {
    this.router.navigate(['/', 'playlist', this.playlistId, 'video', videoId]);
  }

  removeVideo(playlistItemId: string | undefined) {
    if (playlistItemId) {
      const doIt = () => this.store.dispatch(removeFromPlaylist({ playlistItemId }));
      const modalRef = this.modalService.open(ConfirmPromptComponent);
      modalRef.componentInstance.prompt = 'Are you sure you wish to remove this video from the playlist?';
      modalRef.closed.subscribe(c => (c === 'Continue click' ? doIt() : null));
    }
  }

  openVideo(videoId: string) {
    window.open('https://www.youtube.com/watch?v=' + videoId);
  }

  moveToPlaylist(playlistId: string, video: Video): void {
    if (video.videoId) {
      this.store.dispatch(addToPlaylist({ videoId: video.videoId, playlistId }));
    }
    if (video.playlistItemId) {
      this.store.dispatch(removeFromPlaylist({ playlistItemId: video.playlistItemId }));
    }
  }

  keepVideo(video: Video): void {
    if (!this.keepPlaylist) {
      this.toast.fail('You must first set a playlist to use as your "Keep" list in your preferences.', { delay: 10000 });
    } else {
      this.store.dispatch(addToPlaylist({ videoId: video.videoId || '', playlistId: this.keepPlaylist }));
    }
  }
}
