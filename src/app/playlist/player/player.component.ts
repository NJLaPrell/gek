import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerControlsComponent } from 'src/app/playlist/player-controls/player-controls.component';
import { Video } from 'src/app/state/models/video.model';

const DEBUG = true;

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent {
  @ViewChild(PlayerControlsComponent) private playerControls!: PlayerControlsComponent;    // Player controls

  @Input() playlistId!: string;
  @Input() video!: Video;
  @Input() navState: any;
  api: any;
  like = false;
  dislike = false;
  muted = false;
  playing = false;
  
  constructor(
    private router: Router
  ) { }

  // Fires 30 seconds before the end of a video.
  onAlmostOver(e: YT.OnStateChangeEvent) {
    this.debug('onAlmostOver()', e);
    this.playerControls.onAlmostOver();
  }

  // Fires when a video has finished.
  onVideoEnded(e: YT.OnStateChangeEvent) {
    this.debug('onVideoEnded', e);
    if (this.navState.nextVideo) {
      this.goToVideo(this.navState.nextVideo.videoId);
      setTimeout(() => e.target.playVideo(), 1000);
    }
  }

  // Fires when the player API finishes loading.
  onReady(e: YT.PlayerEvent) {
    this.debug('onReady', e);
    this.api = e.target;
    e.target.playVideo();
  }

  // Fires with the api loads a new module.
  onApiChange(e: YT.PlayerEvent) {
    this.debug('onApiChange', e);
  }

  // Navigate to the video with the given videoId.
  goToVideo(videoId: string | undefined) {
    this.debug(`User:goToVideo(${videoId})`);
    if (videoId) {
      this.router.navigate(['/', 'playlist', this.playlistId, 'video', videoId]);
    }
  }

  private debug(...args: any) {
    if(DEBUG) {
      console.debug(...args);
    }
  }

}
