import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  faVolumeXmark, faVolumeHigh, faPlay, faPause,
  faArrowUpRightFromSquare, faEye, faThumbsUp,
  faBackward, faForward, faTrashAlt, faThumbsDown
} from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ConfirmPromptComponent } from '../modals/confirm-prompt/confirm-prompt.component';
import { ToastService } from '../services/toast.service';
import { rateVideo, removeFromPlaylist } from '../state/actions/video.actions';
import { Video } from '../state/models/video.model';
import { sendCommand } from '../state/actions/remote.actions';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-player-controls',
  templateUrl: './player-controls.component.html',
  styleUrls: ['./player-controls.component.scss']
})
export class PlayerControlsComponent {
  faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  faThumbsUp = faThumbsUp;
  faEye = faEye;
  faBackward = faBackward;
  faForward = faForward;
  faTrashAlt = faTrashAlt;
  faThumbsDown = faThumbsDown;
  faPlay = faPlay;
  faPause = faPause;
  faVolumeXmark = faVolumeXmark;
  faVolumeHigh = faVolumeHigh;

  @Input() video: Video | undefined;
  @Input() playlistId = '';
  @Input() navState: any = {};
  @Input() showRemote = false;

  @Input() muted = false;
  @Output() mutedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() volume = 0;
  @Output() volumeChange: EventEmitter<number> = new EventEmitter<number>();

  @Input() progress = 0;
  @Output() progressChange: EventEmitter<number> = new EventEmitter<number>();

  @Input() duration = 0;
  @Output() durationChange: EventEmitter<number> = new EventEmitter<number>();

  @Input() like = false;
  @Output() likeChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() dislike = false;
  @Output() dislikeChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() playing = false;
  @Output() playingChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() videoNavClicked: EventEmitter<Video> = new EventEmitter<Video>();

  @ViewChild('endOfVideoToast') endOfVideoToast!: TemplateRef<any>;  // Template for the end of video toast.

  constructor(
    private store: Store,
    private router: Router,
    private toast: ToastService,
    private modalService: NgbModal
  ) { }

  sendCommand(command: any): void {
    this.store.dispatch(sendCommand( {
      id: uuid(),
      client: 'viewer',
      timestamp: Date.now(),
      command
    }));
  }

  onAlmostOver() {
    console.log('almost over');
    this.toast.info(this.endOfVideoToast);
  }

  onVideoNav(video: Video) {
    console.log('onVideoNav', video);
    if (video?.videoId) {
      this.videoNavClicked.emit(video);
      this.goToVideo(video.videoId);
    }
  }

  onThumbsUp() {
    this.like = !this.like;
    this.likeChange.emit(this.like);
    this.store.dispatch(rateVideo({ videoId: this.video?.videoId || '', rating: this.like ? 'like' : '' }));
    if (this.like && this.dislike) {
      this.dislike = false;
      this.dislikeChange.emit(false);
    }
  }

  onThumbsDown() {
    this.dislike = !this.dislike;
    this.dislikeChange.emit(this.dislike);
    this.store.dispatch(rateVideo({ videoId: this.video?.videoId || '', rating: this.dislike ? 'dislike' : '' }));
    if (this.like && this.dislike) {
      this.like = false;
      this.likeChange.emit(false);
    }
  }

  onRemove() {
    this.removeVideo();
  }

  onOpenInNewWindow() {
    window.open('https://www.youtube.com/watch?v=' + this.video?.videoId);
  }

  onPausePlay() {
    this.playing = !this.playing;
    this.playingChange.emit(this.playing);
    this.pausePlay();
  }

  onToggleMute() {
    this.muted = !this.muted;
    this.mutedChange.emit(this.muted);
    this.toggleMute();
  }

  onVolumeChanged(e: any) {
    if (e.target.value !== this.volume) {
      this.volume = e.target.value;
      this.volumeChange.emit(e.target.value);
      this.changeVolume();
    }
  }

  onSeek(e: any) {
    if (e.target.value !== this.progress) {
      this.progress = e.target.value;
      this.seek();
    }
  }

  onProgressChanged() {
    this.progressChange.emit(this.progress);
  }

  removeVideo() {
    const doIt = () => this.video?.playlistItemId ? this.store.dispatch(removeFromPlaylist({ playlistItemId: this.video?.playlistItemId })) : null;
    const modalRef = this.modalService.open(ConfirmPromptComponent);
    modalRef.componentInstance.prompt = 'Are you sure you wish to remove this video from the playlist?';
    modalRef.closed.subscribe(c => c === 'Continue click' ? doIt() : null);
  }

  goToVideo(videoId: string) {
    this.router.navigate(['/', this.showRemote ? 'remote' : 'player', this.playlistId, videoId]);
  }

  toggleMute() {
    this.sendCommand({ directive: this.muted ? 'unmute' : 'mute' });
  }

  pausePlay() {
    this.sendCommand({ directive: this.playing ? 'play' : 'pause' });
  }

  changeVolume() {
    this.sendCommand({ directive: 'volume', params: { value: this.volume } });
  }

  seek() {
    this.sendCommand({ directive: 'seek', params: { value: this.progress } });
  }

}
