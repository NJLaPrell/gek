import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ElementRef, OnDestroy, ViewChild, Output, EventEmitter, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map, skipWhile } from 'rxjs';
import { Video } from 'src/app/state/models/video.model';
import { getPlaylistVideos, rateVideo, removeFromPlaylist } from '../state/actions/video.actions';
import { selectPlaylistVideos } from '../state/selectors/video.selectors';
import { faArrowUpRightFromSquare, faEye, faThumbsUp, faBackward, faForward, faTrashAlt, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import { selectPlaylistTitles } from '../state/selectors/playlists.selectors';
import { setNavState } from '../state/actions/navState.actions';
import { selectNavState } from '../state/selectors/navState.selectors';
import { ToastService } from '../services/toast.service';
import { ConfirmPromptComponent } from '../modals/confirm-prompt/confirm-prompt.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { selectLists } from '../state/selectors/list.selectors';
import { Playlist } from '../state/models/playlist.model';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  faThumbsUp = faThumbsUp;
  faEye = faEye;
  faBackward = faBackward;
  faForward = faForward;
  faTrashAlt = faTrashAlt;
  faThumbsDown = faThumbsDown;

  @ViewChild('player') player: ElementRef<HTMLDivElement> | false = false;        // Youtube player element
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
  api: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store,
    private router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
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
        } else if(this.api) {
          setTimeout(() => this.api.playVideo(), 200);
        }
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

    // Youtube player API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
  }

  ngAfterViewInit(): void {
    this.onResize();
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
  }

  // Fit the video player width with the page.
  onResize = (): void => {
    if (!this.player)
      return;
    this.videoWidth = Math.min(this.player.nativeElement.clientWidth, 1200);
    this.videoHeight = this.videoWidth * 0.6;
    this._changeDetectorRef.detectChanges();
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

  // Fires on player state changes
  stateChanged(e: any) {
    if (e.data === 0) {
      // The video has ended.
      this.onVideoEnded(e.target);
    } else {
      // Set a timer for when the video is 30 seconds from the end.
      const duration = e.target.playerInfo.duration;
      const endMark = duration - 30;
      const currentMark = e.target.playerInfo.currentTime;
      const secondsToEndMark = endMark - currentMark;
      if (secondsToEndMark > 0) {
        clearTimeout(this.videoTimer);
        this.videoTimer = setTimeout(() => this.onAlmostOver(), secondsToEndMark * 1000);
      }
    }
  }

  // Fires 30 seconds before the end of a video.
  onAlmostOver() {
    this.toast.info(this.endOfVideoToast)
  }

  // Fires when a video has finished.
  onVideoEnded(player: any) {
    console.debug('Video Ended');
    if (this.navState.nextVideo) {
      this.router.navigate(['/', 'player', this.playlistId, this.navState.nextVideo.videoId]);
      setTimeout(() => player.playVideo(), 2000);
    }
  }

  // Fires when the player API finishes loading.
  googleReady(e: any) {
    this.api = e.target;
    e.target.playVideo();
  }

  // Fires with the api loads a new module.
  onApiChange(e: any) {
    console.debug('apiChange');
  }

  // #####################
  // USER ACTIONS
  // #####################

  // Navigate to the video with the given videoId.
  goToVideo(videoId: string | undefined) {
    if (videoId) {
      this.router.navigate(['/', 'player', this.playlistId, videoId]);
    }
  }

  // Like the current video.
  thumbsUp() {
    if (this.video?.videoId) {
      this.store.dispatch(rateVideo({ videoId: this.video?.videoId, rating: 'like' }))
    }
  }

  // Dislike the current video
  thumbsDown() {
    if (this.video?.videoId) {
      this.store.dispatch(rateVideo({ videoId: this.video?.videoId, rating: 'dislike' }))
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

}
