/* eslint-disable dot-notation */
import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map, skipWhile } from 'rxjs';
import { Video } from 'src/app/state/models/video.model';
import { setNavState } from '../state/actions/navState.actions';
import { selectNavState } from '../state/selectors/navState.selectors';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { selectLists, selectPlaylistTitles } from '../state/selectors/list.selectors';
import { Playlist } from '../state/models/list.model';
import { PlayerControlsComponent } from '../player-controls/player-controls.component';

const DEBUG = false;

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('player') player: ElementRef<HTMLDivElement> | false = false;        // Youtube player element
  @ViewChild(PlayerControlsComponent) private playerControls!: PlayerControlsComponent;    // Player controls

  playlistId = '';                  // From the route params.
  videoId = '';                     // From the route params.
  videoList: Video[] = [];          // List of videos in the playlist.
  video: Video | undefined;         // Current video, if routed.
  videoWidth: number | undefined;   // Width set on the player.
  videoHeight: number | undefined;  // Height set on the player.
  loading = false;                  // Loading indicator state (for the playlist).
  videoTimer: any;                  // Time used for triggering the videoAlmostOver event.
  navState: any = {};               // Video navigation state.
  pageTitle = 'YouTube Playlists';
  api: any;
  like = false;
  dislike = false;
  muted = false;
  playing = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store,
    private router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
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
          this.like = false;
          this.dislike = false;
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
    ])
      .pipe(
        skipWhile((r) => r[0].length === 0 || r[2]?.['length'] === 0),
        map((r: any) => ({
          videoList: [...r[0].find((pl: Playlist) => pl.playlistId === this.playlistId)?.videos || []].sort((a: Video, b:Video) => new Date(a.publishedAt || '') > new Date(b.publishedAt || '') ? 1 : -1),
          titleLookup: r[1],
          routeParams: r[2]
        }))
      )
      .subscribe(r => {
        
        
        if (this.videoList.length > 0) {
          //return;
        }
        this.videoList = [...r.videoList];
        this.pageTitle = r.titleLookup[this.playlistId] || 'YouTube Playlists';
        if (this.videoId) {
          this.video = this.videoList.find(v => v.videoId == this.videoId);
          this.pageTitle += ' > ' + this.video?.title;
        } 
        if(this.videoList.length) {
          this.loading = false;
        } else {
          setTimeout(() => this.loading = false, 3000);
        }

        // Set the navigation state in the store. (But not when triggered by a video being removed)
        if (this.videoList.find(v => v.videoId === this.videoId)) {
          this.store.dispatch(setNavState({ 
            props: { 
              playlistId: this.playlistId,
              videoId: this.videoId,
              videoList: this.videoList,
              titleLookup: r.titleLookup
            }
          }));
        }
        
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
  };

  // #####################
  // PLAYER EVENTS
  // #####################

  // Fires on player state changes
  stateChanged(e: YT.OnStateChangeEvent) {
    this.debug('stateChanged', e);
    if (e.data === 0) {
      // The video has ended.
      this.onVideoEnded(e);
    } else {
      // Set a timer for when the video is 30 seconds from the end.
      const duration = e.target.getDuration();
      const endMark = duration - 30;
      const currentMark = e.target.getCurrentTime();
      const secondsToEndMark = endMark - currentMark;
      if (secondsToEndMark > 0) {
        clearTimeout(this.videoTimer);
        this.videoTimer = setTimeout(() => this.onAlmostOver(), secondsToEndMark * 1000);
      }
    }
  }

  // Fires 30 seconds before the end of a video.
  onAlmostOver() {
    this.debug('onAlmostOver()');
    this.playerControls.onAlmostOver();
  }

  // Fires when a video has finished.
  onVideoEnded(e: YT.OnStateChangeEvent) {
    this.debug('onVideoEnded', e);
    if (this.navState.nextVideo) {
      this.router.navigate(['/', 'player', this.playlistId, this.navState.nextVideo.videoId]);
    }
  }

  // Fires when the player API finishes loading.
  googleReady(e: YT.PlayerEvent) {
    this.debug('googleReady', e);
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
      this.router.navigate(['/', 'player', this.playlistId, videoId]);
    }
  }

  private debug(...args: any) {
    if(DEBUG) {
      console.debug(...args);
    }
  }

}
