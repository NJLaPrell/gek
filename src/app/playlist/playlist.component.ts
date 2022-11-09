import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map, skipWhile } from 'rxjs';
import { setNavState } from '../state/actions/navState.actions';
import { Playlist } from '../state/models/list.model';
import { Video } from '../state/models/video.model';
import { selectLists, selectPlaylistTitles } from '../state/selectors/list.selectors';
import { selectNavState } from '../state/selectors/navState.selectors';
import { selectRemoteMode } from '../state/selectors/remote.selectors';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { getPlaylistVideos } from '../state/actions/video.actions';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {
  faRefresh = faRefresh;

  mode!: string;
  playlistId = '';                  // From the route params.
  videoId = '';                     // From the route params.
  videoList: Video[] = [];          // List of videos in the playlist.
  video!: Video;         // Current video, if routed.
  loading = false;
  navState: any = {};               // Video navigation state.
  pageTitle = 'YouTube Playlists';
  lastUpdated!: number;
  playlistLoading = false;
  

  constructor(
    private store: Store,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Set the mode
    this.store.select(selectRemoteMode).subscribe(m => this.mode = m);

    // Set the nav state
    this.store.select(selectNavState).subscribe(n => this.navState = n);

    // Get the route params and dispatch getPlaylistVideos to build the list.
    this.activatedRoute.params.subscribe(params => {
      this.playlistId = params['playlistId'];
      this.videoId = params['videoId'];
      if (this.playlistId && !this.videoId) {
        this.loading = true;
      }
    });

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
          routeParams: r[2],
          lastUpdated: r[0].find((pl: Playlist) => pl.playlistId === this.playlistId).lastUpdated
        }))
      )
      .subscribe(r => {
        this.playlistLoading = false;
        this.videoList = [...r.videoList];
        this.pageTitle = r.titleLookup[this.playlistId] || 'YouTube Playlists';
        this.lastUpdated = r.lastUpdated;
        if (this.videoId) {
          const v = this.videoList.find(v => v.videoId == this.videoId);
          if (v) {
            this.video = v;
          }
          this.pageTitle += ' > ' + this.video?.title;
        } else {
          this.store.dispatch(setNavState({ 
            props: { 
              playlistId: this.playlistId,
              videoId: '',
              videoList: this.videoList,
              titleLookup: r.titleLookup
            }
          }));
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
  }

  refresh(): void {
    this.playlistLoading = true;
    this.store.dispatch(getPlaylistVideos({ playlistId: this.playlistId, bypassCache: true }));
  }

}
