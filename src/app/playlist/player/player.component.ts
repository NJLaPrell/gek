import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { PlayerControlsComponent } from 'src/app/playlist/player-controls/player-controls.component';
import { Video } from 'src/app/state/models/video.model';
import { selectAlmostDonePreference, selectAutoNextPreference, selectAutoPlayPreference } from 'src/app/state/selectors/preferences.selectors';

const DEBUG = true;

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent {
  @ViewChild(PlayerControlsComponent) private playerControls!: PlayerControlsComponent; // Player controls

  almostDonePref!: boolean;
  autoNextPref!: boolean;
  autoPlayPref!: boolean;

  @Input() playlistId!: string;
  @Input() video!: Video;
  @Input() navState: any;

  api: any;
  like = false;
  dislike = false;
  muted = false;
  playing = false;

  constructor(private router: Router, private store: Store) {
    this.store.select(selectAutoNextPreference).subscribe(p => (this.autoNextPref = Boolean(p)));
    this.store.select(selectAlmostDonePreference).subscribe(p => (this.almostDonePref = Boolean(p)));
    this.store.select(selectAutoPlayPreference).subscribe(c => (this.autoPlayPref = Boolean(c)));
  }

  // Fires 30 seconds before the end of a video.
  onAlmostOver(e: YT.OnStateChangeEvent) {
    this.debug('onAlmostOver()', e);
    if (this.almostDonePref) {
      this.playerControls.onAlmostOver();
    }
  }

  // Fires when a video has finished.
  onVideoEnded(e: YT.OnStateChangeEvent) {
    this.debug('onVideoEnded', e);
    if (this.navState.nextVideo && this.autoNextPref) {
      this.goToVideo(this.navState.nextVideo.videoId);
    }
  }

  // Fires when the player API finishes loading.
  onReady(e: YT.PlayerEvent) {
    this.debug('onReady', e);
    this.api = e.target;
  }

  // Fires with the api loads a new module.
  onApiChange(e: YT.PlayerEvent) {
    this.debug('onApiChange', e);
  }

  // Navigate to the video with the given videoId.
  goToVideo(videoId: string | undefined) {
    this.debug(`User:goToVideo(${videoId})`);
    this.like = false;
    this.dislike = false;
    if (videoId) {
      this.router.navigate(['/', 'playlist', this.playlistId, 'video', videoId]);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private debug(...args: any) {
    if (DEBUG) {
      console.debug(...args);
    }
  }

  onError(error: { message: string; error: any }) {
    console.error(error);
  }
}
