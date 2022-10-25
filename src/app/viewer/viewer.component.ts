import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ElementRef, OnDestroy, ViewChild, Output, EventEmitter, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map, skipWhile } from 'rxjs';
import { Video, initialVideoState } from 'src/app/state/models/video.model';
import { getPlaylistVideos, rateVideo, removeFromPlaylist } from '../state/actions/video.actions';
import { selectPlaylistVideos } from '../state/selectors/video.selectors';
import * as moment from 'moment';
import { selectPlaylistTitles } from '../state/selectors/playlists.selectors';
import { setNavState } from '../state/actions/navState.actions';
import { selectNavState } from '../state/selectors/navState.selectors';
import { ToastService } from '../services/toast.service';
import { ConfirmPromptComponent } from '../modals/confirm-prompt/confirm-prompt.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { selectLastCommand } from '../state/selectors/remote.selectors';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('player') player: ElementRef<HTMLDivElement> | false = false;        // Youtube player element
  @ViewChild('endOfVideoToast') endOfVideoToast: TemplateRef<any> | string = '';  // Template for the end of video toast.

  playlistId: string = '';          // From the route params.
  videoId: string = '';             // From the route params.
  videoList: Video[] = [];          // List of videos in the playlist.
  video: Video | undefined;         // Current video, if routed.
  videoWidth: number | undefined;   // Width set on the player.
  videoHeight: number | undefined;  // Height set on the player.
  videoTimer: any;                  // Time used for triggering the videoAlmostOver event.
  moment = moment;                  // Moment for date display
  
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
    });

    this.store.select(selectLastCommand).pipe(skipWhile(c => c === null)).subscribe(c => this.executeCommand(c));

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
  // PLAYER EVENTS
  // #####################

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

  }

  // Fires when the player API finishes loading.
  googleReady(e: any) {
    e.target.playVideo();
    this.api = e.target;
    console.log(this.api);
  }

  // Fires with the api loads a new module.
  onApiChange(e: any) {
    console.debug('apiChange');
  }

  pause(): void {
    this.api?.pauseVideo();
  }

  play(): void {
    this.api?.playVideo();
  }

  setVolume(vol: number) {
    this.api?.setVolume(vol);
  }

  mute() {
    this.api?.mute();
  }

  unmute() {
    this.api?.unMute();
  }

  // #####################
  // USER ACTIONS
  // #####################

  // Navigate to the video with the given videoId.
  goToVideo(playlistId: string, videoId: string) {
    console.log('goToVideo', playlistId, videoId);
    this.videoId = videoId;
    this.playlistId = playlistId;
    if (this.api) {
      console.log('API');
      setTimeout(() => this.api.playVideo(videoId), 200);
    } else {
      console.log('no API');
    }
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }

  // Open the video in a new window
  openInNewWindow() {
    window.open(this.video?.link);
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
    }
  }

}
