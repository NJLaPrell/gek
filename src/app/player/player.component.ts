import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { skipWhile } from 'rxjs';
import { Video, initialVideoState } from 'src/app/state/models/video.model';
import { getPlaylistVideos } from '../state/actions/video.actions';
import { selectPlaylistVideos } from '../state/selectors/video.selectors';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, AfterViewInit, OnDestroy {
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
      if (this.playlistId && !this.videoId) {
        this.loading = true;
        this.store.dispatch(getPlaylistVideos({ playlistId: this.playlistId }));
      }
      
    });

    this.store.select(selectPlaylistVideos).pipe(skipWhile(r => !r || !r[this.playlistId])).subscribe(r => {
      this.videoList = r[this.playlistId];
      if (this.videoId) {
        console.log('foo');
        console.log(this.videoList);
        this.video = this.videoList.find(v => v.id = this.videoId);
      }
      if(r[this.playlistId].length) {
        this.loading = false;
      } else {
        setTimeout(() => this.loading = false, 3000);
      }
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
    console.log(e);
  }

  getViewCount(views: number | undefined): string {
    return ((views || 0 > 999) ? ((views || 0) / 1000).toFixed(1) + 'K' : views) + ' views';
  }

}
