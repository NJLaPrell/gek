import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { faArrowUpRightFromSquare, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ConfirmPromptComponent } from 'src/app/modals/confirm-prompt/confirm-prompt.component';
import { removeFromPlaylist } from 'src/app/state/actions/video.actions';
import { Video } from 'src/app/state/models/video.model';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.scss']
})
export class VideoListComponent {
  // Fontawesome
  faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  faEye = faEye;
  faTrash = faTrash;

  @Input() playlistId = '';
  @Input() videoList: Video[] = [];

  constructor(
    private router: Router,
    private store: Store,
    private modalService: NgbModal
  ) { }

  videoClicked(videoId: string) {
    this.router.navigate(['/', 'playlist', this.playlistId, 'video', videoId]);
  }

  removeVideo(playlistItemId: string | undefined) {
    if (playlistItemId) {
      const doIt = () => this.store.dispatch(removeFromPlaylist({ playlistItemId }));
      const modalRef = this.modalService.open(ConfirmPromptComponent);
      modalRef.componentInstance.prompt = 'Are you sure you wish to remove this video from the playlist?';
      modalRef.closed.subscribe(c => c === 'Continue click' ? doIt() : null);
    }
  }

  openVideo(videoId: string) {
    window.open('https://www.youtube.com/watch?v=' + videoId);
  }

}
