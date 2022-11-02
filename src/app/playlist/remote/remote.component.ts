import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Video } from 'src/app/state/models/video.model';
import { PlayerControlsComponent } from '../player-controls/player-controls.component';
import { v4 as uuid } from 'uuid';
import { sendCommand } from 'src/app/state/actions/remote.actions';
import { selectLastCommand } from 'src/app/state/selectors/remote.selectors';
import { skipWhile } from 'rxjs';

const DEBUG = true;

@Component({
  selector: 'app-remote',
  templateUrl: './remote.component.html',
  styleUrls: ['./remote.component.scss']
})
export class RemoteComponent implements OnInit {
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

  @ViewChild(PlayerControlsComponent) private playerControls!: PlayerControlsComponent;    // Player controls
  
  constructor(
    private router: Router,
    private store: Store,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.store.select(selectLastCommand).pipe(skipWhile(c => c === null)).subscribe(c => this.executeCommand(c));
  }

  // videoId Changes.
  ngOnChanges(changes: SimpleChanges) {
    if (changes['video'].currentValue && changes['video'].currentValue.videoId !== changes['videoId']?.previousValue?.videoId) {
      this.sendCommand({ directive: 'navigate', params: { playlistId: this.playlistId, videoId: changes['video'].currentValue.videoId }});
      this.playing = true;
      this.like = false;
      this.dislike = false;
    }
  }

  // Fires 30 seconds before the end of a video.
  onAlmostOver() {
    this.debug('onAlmostOver()');
    this.playerControls.onAlmostOver();
  }

  onProgressChange(loc: number){
    if (loc !== this.progress) {
      this.sendCommand({ directive: 'seek', params: { value: loc } });
    }
  }


  executeCommand(c: any) {
    
    switch (c.command.directive) {
    case 'updateVideoState':
      this.videoState = c.command.params;
      this.muted = c.command.params.muted;
      this.volume = c.command.params.volume;
      this.duration = c.command.params.duration;
      this.progress = c.command.params.currentTime;
      break;

    case 'almostOver':
      console.log('almostOver', c);
      this.onAlmostOver();
      break;
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
