import { Component, OnInit, ViewChild,  TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map, skipWhile } from 'rxjs';
import { Video } from 'src/app/state/models/video.model';
import { getPlaylistVideos, rateVideo, removeFromPlaylist } from '../state/actions/video.actions';
import { selectPlaylistVideos } from '../state/selectors/video.selectors';
import { faVolumeXmark, faVolumeHigh, faPlay, faPause, faArrowUpRightFromSquare, faEye, faThumbsUp, faBackward, faForward, faTrashAlt, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import { selectPlaylistTitles } from '../state/selectors/playlists.selectors';
import { setNavState } from '../state/actions/navState.actions';
import { selectNavState } from '../state/selectors/navState.selectors';
import { ToastService } from '../services/toast.service';
import { ConfirmPromptComponent } from '../modals/confirm-prompt/confirm-prompt.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { sendCommand } from '../state/actions/remote.actions';
import { v4 as uuid } from 'uuid';
import { selectLists } from '../state/selectors/list.selectors';
import { Playlist } from '../state/models/playlist.model';

@Component({
  selector: 'app-remote',
  templateUrl: './remote.component.html',
  styleUrls: ['./remote.component.scss']
})
export class RemoteComponent implements OnInit {
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


  @ViewChild('endOfVideoToast') endOfVideoToast: TemplateRef<any> | string = '';  // Template for the end of video toast.

  playlistId: string = '';          // From the route params.
  videoId: string = '';             // From the route params.
  videoList: Video[] = [];          // List of videos in the playlist.
  video: Video | undefined;         // Current video, if routed.
  videoWidth: number | undefined;   // Width set on the player.
  videoHeight: number | undefined;  // Height set on the player.
  loading = false;                  // Loading indicator state (for the playlist).
  videoTimer: any;                  // Time used for triggering the videoAlmostOver event.
  moment = moment;                  // Moment for date display
  navState: any = {};               // Video navigation state.
  playing = false;
  muted = false;
  volume = 50;

  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store,
    private router: Router,
    private toast: ToastService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    // Get the route params and dispatch getPlaylistVideos to build the list.
    this.activatedRoute.params.subscribe(params => {
      this.playlistId = params['playlistId'];
      this.videoId = params['videoId'];
      if (this.playlistId) {
        if (!this.videoId) {
          this.loading = true;
        }
        //this.store.dispatch(getPlaylistVideos({ playlistId: this.playlistId }));
      }
      if (this.playlistId && this.videoId) {
        this.sendCommand({ directive: 'navigate', params: { playlistId: this.playlistId, videoId: this.videoId }});
        this.playing = true;
      }
    });

    // Listen for navState changes and update this.navState
    this.store.select(selectNavState).subscribe(n => this.navState = n);

    // Wait until we have the video list for the playlist, the playlist title lookup, and the route params to get them.
    combineLatest([
          this.store.select(selectLists),
          this.store.select(selectPlaylistTitles),
          this.activatedRoute.params
        ]
    )
      .pipe(
        skipWhile((r) => r[0].length === 0 || r[2]?.['length'] === 0),
        map((r: any) => ({
          videoList: [...r[0].find((pl: Playlist) => pl.playlistId === this.playlistId).videos].sort((a: Video, b:Video) => new Date(a.publishedAt || '') > new Date(b.publishedAt || '') ? 1 : -1),
          titleLookup: r[1],
          routeParams: r[2]
        }))
      )
      .subscribe(r => {
        if (this.videoList.length > 0) {
          //return;
        }
        this.videoList = [...r.videoList];
        if (this.videoId) {
          this.video = this.videoList.find(v => v.videoId == this.videoId);
        } 
        if(this.videoList.length) {
          this.loading = false;
        } else {
          setTimeout(() => this.loading = false, 3000);
        }

        // Set the navigation state in the store.
        this.store.dispatch(setNavState({ 
          props: { 
            playlistId: this.playlistId,
            videoId: this.videoId,
            videoList: this.videoList,
            titleLookup: r.titleLookup
          }
        }));
      });


  }


  // #####################
  // FORMATERS
  // #####################
  // TODO: Use pipes.
  
  // Format view count
  getViewCount(views: number | undefined): string {
    return (views || 0 > 999) ? ((views || 0) / 1000).toFixed(1) + 'K' : String(views);
  }

  // Format thumb count with commas. 
  getThumbCount(count: number | undefined): string | void {
    if (count) {
      return Number(count).toLocaleString();
    }
  }

  // #####################
  // PLAYER EVENTS
  // #####################

  videoClicked(videoId: string): void {
    this.goToVideo(videoId);
  }

  

  // #####################
  // USER ACTIONS
  // #####################

  // Navigate to the video with the given videoId.
  goToVideo(videoId: string | undefined) {
    if (videoId) {
      this.router.navigate(['/', 'remote', this.playlistId, videoId]);
    }
  }

  // Like the current video.
  thumbsUp() {
    if (this.video?.videoId) {
      this.store.dispatch(rateVideo({ videoId: this.video.videoId, rating: 'like' }))
    }
  }

  // Dislike the current video
  thumbsDown() {
    if (this.video?.videoId) {
      this.store.dispatch(rateVideo({ videoId: this.video.videoId, rating: 'dislike' }))
    }
  }

  // Remove the current video from the playlist.
  remove(confirm = true) {
    const doIt = () => this.video?.playlistItemId ? this.store.dispatch(removeFromPlaylist({ playlistItemId: this.video?.playlistItemId })) : null;
    if (confirm) {
      const modalRef = this.modalService.open(ConfirmPromptComponent);
      modalRef.componentInstance.prompt = 'Are you sure you wish to remove this video from the playlist?';
      modalRef.closed.subscribe(c => c === 'Continue click' ? doIt() : null);
    } else {
      doIt();
    }
  }

  // Open the video in a new window
  openInNewWindow() {
    window.open('https://www.youtube.com/watch?v=' + this.video?.videoId);
  }

  toggleMute() {
    this.sendCommand({ directive: this.muted ? 'unmute' : 'mute' });
    this.muted = !this.muted;
  }

  pausePlay() {
    this.sendCommand({ directive: this.playing ? 'pause' : 'play' });
    this.playing = !this.playing;
  }

  volumeChange() {
    this.sendCommand({ directive: 'volume', params: { value: this.volume } });
  }

  sendCommand(command: any): void {
    this.store.dispatch(sendCommand( {
      id: uuid(),
      client: 'viewer',
      timestamp: Date.now(),
      command
    }));
  }

}
