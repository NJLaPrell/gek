import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ElementRef, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map, skipWhile } from 'rxjs';
import { Video, initialVideoState } from 'src/app/state/models/video.model';
import { getPlaylistVideos } from '../state/actions/video.actions';
import { selectPlaylistVideos } from '../state/selectors/video.selectors';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import { selectPlaylists, selectPlaylistTitles } from '../state/selectors/playlists.selectors';
import { setNavState } from '../state/actions/navState.actions';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() onPageTitleChange: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('player') player: ElementRef<HTMLDivElement> | false = false;
  playlistId: string = '';
  videoId: string = '';
  videoList: Video[] = [];
  video: Video | undefined;

  videoWidth: number | undefined;
  videoHeight: number | undefined;

  faArrowUpRightFromSquare = faArrowUpRightFromSquare;

  loading = false;

  moment = moment;
  videoNavState: any = {};

  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store,
    private router: Router,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.playlistId = params['playlistId'];
      this.videoId = params['videoId'];
      if (this.playlistId) {
        if (!this.videoId) {
          this.loading = true;
        }
        this.store.dispatch(getPlaylistVideos({ playlistId: this.playlistId }));
      }
      
    });

    // Wait until we have both the video list for the playlist and they playlist title lookup.
    combineLatest([
          this.store.select(selectPlaylistVideos),
          this.store.select(selectPlaylistTitles),
          this.activatedRoute.params
        ]
    )
      .pipe(
        skipWhile((r) => r[0][this.playlistId].length === 0 || !r[0][this.playlistId] || r[2]['length'] === 0),
        map((r: any) => ({
          videoList: r[0][this.playlistId].sort((a:any, b:any) => new Date(a.published) > new Date(b.published) ? 1 : -1),
          titleLookup: r[1],
          routeParams: r[2]
        }))
      )
      .subscribe(r => {
        this.videoList = r.videoList;
        if (this.videoId) {
          this.video = this.videoList.find(v => v.id == this.videoId);
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

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
  }

  ngAfterViewInit(): void {
    this.onResize();
    window.addEventListener('resize', this.onResize);
  }

  onResize = (): void => {
    if (!this.player)
      return;
    // Automatically expand the video to fit the page up to 1200px x 720px
    this.videoWidth = Math.min(this.player.nativeElement.clientWidth, 1200);
    this.videoHeight = this.videoWidth * 0.6;
    this._changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
  }

  videoClicked(videoId: string): void {
    this.router.navigate(['/', 'player', this.playlistId, videoId]);
  }

  stateChanged(e: any) {
    console.log('stateChanged');
    console.log(e);
  }

  googleReady(e: any) {
    console.log('google ready', e);
    e.target.playVideo();
  }

  getViewCount(views: number | undefined): string {
    return ((views || 0 > 999) ? ((views || 0) / 1000).toFixed(1) + 'K' : views) + ' views';
  }

}
