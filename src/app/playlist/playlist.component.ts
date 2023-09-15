import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, filter, map } from 'rxjs';
import { setNavState } from '../state/actions/navState.actions';
import { Playlist } from '../state/models/list.model';
import { Video } from '../state/models/video.model';
import { selectLists, selectPlaylistTitles } from '../state/selectors/list.selectors';
import { selectNavState } from '../state/selectors/navState.selectors';
import { selectRemoteMode } from '../state/selectors/remote.selectors';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { getPlaylistVideos } from '../state/actions/video.actions';
import { initialNavState, NavState } from 'server/models/shared/navState.model';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
})
export class PlaylistComponent {
  faRefresh = faRefresh;

  mode!: string;
  playlistId = '';
  videoId = '';
  videoList: Video[] = [];
  video!: Video;
  loading: boolean;
  navState: NavState = initialNavState;
  globalNavState!: NavState;
  playlistTitle = 'YouTube Playlists';
  lastUpdated!: number;
  playlistLoading: boolean;

  constructor(
    private store: Store,
    private activatedRoute: ActivatedRoute
  ) {
    this.playlistLoading = false;
    this.loading = false;

    // Set the mode
    this.store.select(selectRemoteMode).subscribe(m => (this.mode = m));

    // Set the nav state
    this.store.select(selectNavState).subscribe(n => (this.globalNavState = n));

    // Get the route params and dispatch getPlaylistVideos to build the list.
    this.activatedRoute.paramMap.subscribe(m => {
      this.playlistId = m.get('playlistId') || '';
      this.videoId = m.get('videoId') || '';
      if (this.playlistId && !this.videoId) {
        this.loading = true;
      }
    });

    // Wait until we have the video list for the playlist, the playlist title lookup, and the route params to get them.
    combineLatest([this.store.select(selectLists), this.store.select(selectPlaylistTitles), this.activatedRoute.paramMap])
      .pipe(
        filter((r: any) => r[0].length > 0 && r[2]),
        map((r: any) => ({
          videoList: [...(r[0].find((pl: Playlist) => pl.playlistId === this.playlistId)?.videos || [])].sort((a: Video, b: Video) =>
            new Date(a.publishedAt || '') > new Date(b.publishedAt || '') ? 1 : -1
          ),
          titleLookup: r[1],
          routeParams: { playlistId: r[2].get('playlistId'), videoId: r[2].get('videoId') },
          lastUpdated: r[0].find((pl: Playlist) => pl.playlistId === this.playlistId).lastUpdated,
        }))
      )
      .subscribe(r => {
        this.playlistLoading = false;
        this.videoList = <Video[]>[...r.videoList];
        this.playlistTitle = r.titleLookup[this.playlistId] || 'YouTube Playlists';
        this.lastUpdated = r.lastUpdated;
        if (r.routeParams.videoId) {
          const v = this.videoList.find(v => v.videoId == r.routeParams.videoId);
          this.video = v ?? this.video;
          if (v) {
            this.video = v;
            const vIx = this.videoList.findIndex(v => v.videoId === this.video.videoId);
            this.navState.currentVideo = v;
            this.navState.videoId = this.video.videoId ?? '';
            this.navState.videoTitle = this.video.title;
            this.navState.nextVideo = this.videoList.length > vIx + 1 ? this.videoList[vIx + 1] : false;
            this.navState.previousVideo = vIx > 0 ? this.videoList[vIx - 1] : false;
          }
        }

        if (this.videoList.length) {
          this.loading = false;
        } else {
          setTimeout(() => (this.loading = false), 3000);
        }

        // Set the navigation state in the store.
        this.store.dispatch(
          setNavState({
            props: {
              playlistId: this.playlistId,
              videoId: this.videoId,
              videoList: this.videoList,
              titleLookup: r.titleLookup,
            },
          })
        );
      });
  }

  refresh(): void {
    this.playlistLoading = true;
    this.store.dispatch(getPlaylistVideos({ playlistId: this.playlistId, bypassCache: true }));
  }
}
