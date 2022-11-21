import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { skipWhile } from 'rxjs';
import { sendCommand } from 'src/app/state/actions/remote.actions';
import { Video } from 'src/app/state/models/video.model';
import { selectAutoPlayPreference } from 'src/app/state/selectors/preferences.selectors';
import { selectLastCommand } from 'src/app/state/selectors/remote.selectors';
import { v4 as uuid } from 'uuid';
import { environment } from '../../../environments/environment';

const STATE_INTERVAL = environment.viewerStateInterval;
const DEBUG = environment.debug.viewerComponent;

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
  autoPlay = true;
  youtubeWindow: any = false;
  externalOnly = false;
  
  constructor(
    private store: Store
  ) { }

  ngOnInit(): void {
    this.store.select(selectLastCommand).pipe(skipWhile(c => c === null)).subscribe(c => this.executeCommand(c));
    this.store.select(selectAutoPlayPreference).subscribe(c => this.autoPlay = Boolean(c));
  }

  // #####################
  // PLAYER EVENTS
  // #####################

  // Fires 30 seconds before the end of a video.
  onAlmostOver(e: YT.OnStateChangeEvent) {
    this.debug('onAlmostOver()', e);
    this.sendCommand({
      directive: 'almostOver'
    });
  }

  // Fires when a video has finished.
  onVideoEnded(e: YT.OnStateChangeEvent) {
    this.debug('Video Ended', e);
    this.sendCommand({
      directive: 'videoEnded'
    });
  }

  // Fires when the player API finishes loading.
  onReady(e: YT.PlayerEvent) {
    this.debug('onReady()', e);
    this.api = e.target;
    this.externalOnly = this.api.getVideoData().errorCode === 'auth';
    this.playerStateInterval();
  }

  // Fires with the api loads a new module.
  onApiChange(e: any) {
    this.debug('onApiChange()', e);
    this.sendPlayerState();
  }

  pause(): void {
    this.debug('pause()');
    try {
      this.api?.pauseVideo();
    } catch (error) {
      this.onError({ message: 'Error pausing video.', error });
    }
  }

  play(): void {
    this.debug('play()');
    try {
      if (this.externalOnly) {
        this.handleExternal();
      } else {
        this.api?.playVideo();
      }
    } catch (error) {
      this.onError({ message: 'Error playing video.', error });
    }
  }

  setVolume(vol: number) {
    this.debug(`setVolume(${vol})`);
    try {
      this.api?.setVolume(vol);
    } catch (error) {
      this.onError({ message: 'Error setting video volume.', error });
    }
  }

  seek(loc: number) {
    this.debug(`seek(${loc})`);
    try {
      this.api?.seekTo(loc);
    } catch (error) {
      this.onError({ message: 'Error seeking.', error });
    }
  }

  mute() {
    this.debug('mute()');
    try {
      this.api?.mute();
    } catch (error) {
      this.onError({ message: 'Error muting video.', error });
    }
  }

  unmute() {
    this.debug('unmute()');
    try {
      this.api?.unMute();
    } catch (error) {
      this.onError({ message: 'Error unmuting video.', error });
    }
  }

  // #####################
  // USER ACTIONS
  // #####################

  // Navigate to the video with the given videoId.
  goToVideo(playlistId: string, videoId: string) {
    this.videoId = videoId;
    this.playlistId = playlistId;
    /*
    if (this.autoPlay) {
      setTimeout(() => {
        try {
          if (this.externalOnly) {
            this.handleExternal();
          } else {
            this.api.playVideo(videoId);
          }
        } catch (error) {
          this.onError({ message: 'Error playing video.', error });
        }
      }, 200);
      setTimeout(() => this.sendPlayerState(), 400);
    }
    */
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

    case 'closeExternal':
      this.youtubeWindow?.close();
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
          volume: this.api.playerInfo.volume,
          externalOnly: this.externalOnly
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

  onError(error: { message: string; error: any }) {
    console.error(error);
    this.sendCommand({ directive: 'error', error: { message: error.message, error: error.error.message } });
  }

  onExternalHandlerChange(handler: any) {
    if (handler) {
      this.externalOnly = true;
      this.youtubeWindow = handler;
    } else {
      this.externalOnly = false;
      this.youtubeWindow = false;
    }
  }

  private handleExternal = () => {
    const externalOnly = this.api.getVideoData().errorCode === 'auth';
    if (externalOnly) {
      this.debug(`Opening external player (${this.api.getVideoUrl()})...`);
      this.youtubeWindow = window.open(this.api.getVideoUrl(), '_blank');
    }
  };

  private debug(...args: any) {
    if(DEBUG) {
      console.debug(...args);
    }
  }

}
