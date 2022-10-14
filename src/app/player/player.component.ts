import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { skipWhile } from 'rxjs';
import { Video, initialVideoState } from 'src/app/state/models/video.model';
import { getPlaylistVideos } from '../state/actions/video.actions';
import { selectPlaylistVideos } from '../state/selectors/video.selectors';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  playlistId: string = '';
  videoId: string = '';
  videoList: Video[] = [];

  faArrowUpRightFromSquare = faArrowUpRightFromSquare;

  loading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store,
    private router: Router
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
      if(r[this.playlistId].length) {
        this.loading = false;
      } else {
        setTimeout(() => this.loading = false, 3000);
      }
      
    });
  }

  videoClicked(videoId: string): void {
    this.router.navigate(['/', 'player', this.playlistId, videoId]);
  }

}
