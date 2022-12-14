import { ChangeDetectorRef, Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Video } from 'src/app/state/models/video.model';
import { PlayerControlsComponent } from '../player-controls/player-controls.component';
import { v4 as uuid } from 'uuid';
import { sendCommand } from 'src/app/state/actions/remote.actions';
import { selectLastCommand } from 'src/app/state/selectors/remote.selectors';
import { skipWhile } from 'rxjs';
import { environment } from '../../../environments/environment';
import { selectAutoNextPreference, selectAlmostDonePreference } from 'src/app/state/selectors/preferences.selectors';
import { ToastService } from '../../services/toast.service';

const DEBUG = environment.debug.remoteComponent;

@Component({
  selector: 'app-remote',
  templateUrl: './remote.component.html',
  styleUrls: ['./remote.component.scss']
})
export class RemoteComponent {
  @Input() playlistId!: string;
  @Input() video!: Video;
  @Input() navState: any;
  api: any;
  like = false;
  dislike = false;
  muted = false;
  playing = false;
  volume = 0;
  duration = 0;
  progress = 0;
  videoState = {};
  externalOnly = false;

  autoNextPref = false;
  almostDonePref = false;

  @ViewChild(PlayerControlsComponent) private playerControls!: PlayerControlsComponent;    // Player controls
  
  constructor(
    private router: Router,
    private store: Store,
    private _changeDetectorRef: ChangeDetectorRef,
    private toast: ToastService,
  ) {
    this.store.select(selectLastCommand).pipe(skipWhile(c => c === null)).subscribe(c => this.executeCommand(c));
    this.store.select(selectAutoNextPreference).subscribe(p => this.autoNextPref = p);
    this.store.select(selectAlmostDonePreference).subscribe(p => this.almostDonePref = p);
  }

  // videoId Changes.
  ngOnChanges(changes: SimpleChanges) {
    if (changes['video']?.currentValue && changes['video']?.currentValue.videoId !== changes['videoId']?.previousValue?.videoId) {
      this.sendCommand({ directive: 'navigate', params: { playlistId: this.playlistId, videoId: changes['video'].currentValue.videoId } });
      this.playing = true;
      this.like = false;
      this.dislike = false;
    }
  }

  // Fires 30 seconds before the end of a video.
  onAlmostOver() {
    this.debug('onAlmostOver()');
    if (this.almostDonePref) {
      this.playerControls.onAlmostOver();
    }
  }

  onVideoEnded() {
    this.debug('onVideoEnded()');
    const nextVideoId = this.navState.nextVideo?.videoId;
    if (this.autoNextPref && nextVideoId) {
      this.like = false;
      this.dislike = false;
      this.router.navigate(['/', 'playlist', this.playlistId, 'video', nextVideoId]);
    }
  }

  onProgressChange(loc: number){
    if (loc !== this.progress) {
      this.sendCommand({ directive: 'seek', params: { value: loc } });
    }
  }

  onCloseExternal() {
    this.sendCommand({ directive: 'closeExternal', params: {} });
  }


  executeCommand(c: any) {
    
    switch (c.command.directive) {
    case 'updateVideoState':
      this.videoState = c.command.params;
      this.muted = c.command.params.muted;
      this.volume = c.command.params.volume;
      this.duration = c.command.params.duration;
      this.progress = c.command.params.currentTime;
      this.externalOnly = c.command.params.externalOnly;
      break;

    case 'almostOver':
      this.debug('almostOver', c);
      this.onAlmostOver();
      break;

    case 'videoEnded':
      this.debug('videoEnded', c);
      this.onVideoEnded();
      break;

    case 'error':
      console.error(c.command.error);
      this.toast.fail(JSON.stringify(c.command.error.error), { delay: 30000, header: c.command.message });
    }
  }

  sendCommand(command: any): void {
    this.store.dispatch(sendCommand( {
      id: uuid(),
      client: 'viewer',
      timestamp: Date.now(),
      command
    }));
  }

  private debug(...args: any) {
    if(DEBUG) {
      console.debug(...args);
    }
  }

}
