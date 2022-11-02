import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { skipWhile } from 'rxjs';
import { sendCommand } from 'src/app/state/actions/remote.actions';
import { Video } from 'src/app/state/models/video.model';
import { selectLastCommand } from 'src/app/state/selectors/remote.selectors';
import { v4 as uuid } from 'uuid';

const STATE_INTERVAL = 5000;
const DEBUG = true;

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit {
  @Input() playlistId!: string;
  @Input() video!: Video;
  @Input() navState: any;
  videoId = '';
  api: any;
  playerStateTimer: any;
  
  constructor(
    private store: Store
  ) { }

  ngOnInit(): void {
    this.store.select(selectLastCommand).pipe(skipWhile(c => c === null)).subscribe(c => this.executeCommand(c));
  }

  // #####################
  // PLAYER EVENTS
  // #####################

  // Fires on player state changes
  //stateChanged(e: YT.OnStateChangeEvent) {
  //  this.sendPlayerState();
  //}

  // Fires 30 seconds before the end of a video.
  onAlmostOver(e: YT.OnStateChangeEvent) {
    this.debug('onAlmostOver()', e);
    this.sendCommand({
      directive: 'almostOver'
    });
  }

  // Fires when a video has finished.
  onVideoEnded(e: YT.OnStateChangeEvent) {
    console.debug('Video Ended', e);
  }

  // Fires when the player API finishes loading.
  onReady(e: YT.PlayerEvent) {
    this.debug('onReady()', e);
    this.api = e.target;
    this.api.playVideo();
    this.playerStateInterval();
  }

  // Fires with the api loads a new module.
  onApiChange(e: any) {
    this.debug('onApiChange()', e);
    this.sendPlayerState();
  }

  pause(): void {
    this.debug('pause()');
    this.api?.pauseVideo();
  }

  play(): void {
    this.debug('play()');
    this.api?.playVideo();
  }

  setVolume(vol: number) {
    this.debug(`setVolume(${vol})`);
    this.api?.setVolume(vol);
  }

  seek(loc: number) {
    this.debug(`seek(${loc})`);
    this.api?.seekTo(loc);
  }

  mute() {
    this.debug('mute()');
    this.api?.mute();
  }

  unmute() {
    this.debug('unmute()');
    this.api?.unMute();
  }

  // #####################
  // USER ACTIONS
  // #####################

  // Navigate to the video with the given videoId.
  goToVideo(playlistId: string, videoId: string) {
    this.videoId = videoId;
    this.playlistId = playlistId;
    if (this.api) {
      setTimeout(() => this.api.playVideo(videoId), 200);
      setTimeout(() => this.sendPlayerState(), 400);
    }
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }


  executeCommand(c: any) {
    switch (c.command.directive) {
    case 'navigate':
      this.goToVideo(c.command.params.playlistId, c.command.params.videoId);
      break;
      
    case 'pause':
      this.pause();
      break;

    case 'play':
      this.play();
      break;

    case 'unmute':
      this.unmute();
      break;

    case 'mute':
      this.mute();
      break;

    case 'volume':
      this.setVolume(c.command.params.value);
      break;

    case 'seek':
      this.seek(c.command.params.value);
      break;
    }
    setTimeout(() => this.sendPlayerState(), 200);
  }

  sendPlayerState() {
    if (this.api) {
      this.sendCommand({
        directive: 'updateVideoState',
        params: {
          currentTime: this.api.playerInfo.currentTime,
          duration: this.api.playerInfo.duration,
          muted: this.api.playerInfo.muted, 
          volume: this.api.playerInfo.volume
        }
      });
    }
  }

  sendCommand(command: any): void {
    this.store.dispatch(sendCommand( {
      id: uuid(),
      client: 'remote',
      timestamp: Date.now(),
      command
    }));
  }

  playerStateInterval() {
    this.sendPlayerState();
    clearTimeout(this.playerStateTimer);
    this.playerStateTimer = setTimeout(() => this.playerStateInterval(), STATE_INTERVAL);
  }

  private debug(...args: any) {
    if(DEBUG) {
      console.debug(...args);
    }
  }

}
