import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Video } from 'src/app/state/models/video.model';
import { selectErrorQueue, selectUnsorted } from 'src/app/state/selectors/history.selectors';
import * as moment from 'moment';
import { faTrash, faInfoCircle, faTriangleExclamation, faArrowTurnUp } from '@fortawesome/free-solid-svg-icons';
import { deleteErrorItem, deleteUnsortedItem, purgeUnsorted } from 'src/app/state/actions/history.actions';
import { ConfirmPromptComponent } from '../confirm-prompt/confirm-prompt.component';
import { selectPlaylistTitles } from 'src/app/state/selectors/list.selectors';
import { addToPlaylist, addToPlaylistSuccess } from 'src/app/state/actions/video.actions';
import { Actions, ofType } from '@ngrx/effects';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-unsorted',
  templateUrl: './unsorted.component.html',
  styleUrls: ['./unsorted.component.scss'],
})
export class UnsortedComponent implements OnInit, OnDestroy {
  // Fontawesome
  faTrash = faTrash;
  faInfoCircle = faInfoCircle;
  faTriangleExclamation = faTriangleExclamation;
  faArrowTurnUp = faArrowTurnUp;

  // State
  unsorted: Video[] = [];
  playlists: any = [];
  showErrors = false;

  // Utilities
  moment = moment;

  private onDestroy$ = new Subject();

  constructor(public activeModal: NgbActiveModal, private store: Store, private modalService: NgbModal, private actions$: Actions) {}

  ngOnInit(): void {
    this.store.select(selectUnsorted).subscribe(u => {
      this.unsorted = [...u];
      this.sortList();
    });
    this.store.select(selectErrorQueue).subscribe(e => {
      this.unsorted = this.unsorted.concat(e.map(f => ({ ...f.video, errorMessage: { errors: f.errors, failDate: f.failDate } })));
      this.sortList();
    });
    this.store.select(selectPlaylistTitles).subscribe(
      pl =>
        (this.playlists = Object.keys(pl)
          .map(plid => ({ id: plid, title: pl[plid] }))
          .map(pl => ({ title: pl.title, id: pl.id })))
    );

    // Delete the video when added to a playlist.
    this.actions$.pipe(ofType(addToPlaylistSuccess), takeUntil(this.onDestroy$)).subscribe(props => {
      const video = <Video>this.unsorted.find(v => v.videoId == props.videoId);
      this.deleteItem(video);
    });
  }

  ngOnDestroy(): void {
    //this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  purge() {
    const modalRef = this.modalService.open(ConfirmPromptComponent);
    modalRef.componentInstance.prompt = 'Are you sure you wish to purge the list of unsorted videos?';
    modalRef.closed.subscribe(c => {
      if (c === 'Continue click') {
        this.store.dispatch(purgeUnsorted());
        this.activeModal.close();
      }
    });
  }

  getPlaylistTitle(id: string): string {
    return this.playlists.find((pl: any) => pl.id === id)?.title || 'Move to Playlist...';
  }

  moveToPlaylist(playlistId: string, videoId: string) {
    this.store.dispatch(addToPlaylist({ videoId, playlistId }));
  }

  deleteItem(video: Video) {
    if (video?.errorMessage) {
      this.store.dispatch(deleteErrorItem({ id: video.videoId || '' }));
    } else {
      this.store.dispatch(deleteUnsortedItem({ id: video.videoId || '' }));
    }
  }

  sortList() {
    this.unsorted.sort((a, b) => (new Date(a?.published || 0) > new Date(b?.published || 0) ? 1 : -1));
  }

  getUnsortedCount() {
    return this.showErrors ? this.unsorted.length : this.unsorted.filter(u => !u?.errorMessage).length;
  }

  openVideo(videoId: string) {
    window.open('https://www.youtube.com/watch?v=' + videoId);
  }
}
