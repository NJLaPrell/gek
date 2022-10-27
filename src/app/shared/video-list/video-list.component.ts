import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faArrowUpRightFromSquare, faEye } from '@fortawesome/free-solid-svg-icons';
import { Video } from 'src/app/state/models/video.model';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.scss']
})
export class VideoListComponent implements OnInit {
  // Fontawesome
  faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  faEye = faEye;

  @Input() playlistId: string = '';
  @Input() videoList: Video[] = [];
  @Input() mode: string = '';

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  videoClicked(videoId: string) {
    this.router.navigate(['/', this.mode === 'remote' ? 'remote' : 'player', this.playlistId, videoId]);
  }

}
