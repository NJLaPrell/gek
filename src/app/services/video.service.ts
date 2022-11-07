import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Video } from '../state/models/video.model';
import { map, Observable, shareReplay } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class VideoService {
  constructor(
        private http: HttpClient
  ) { }

  getChannelVideos = (channelId: string): Observable<Video[]> =>this.http.get<Video[]>(`/api/getChannelFeed/${channelId}`).pipe(shareReplay());

  getPlaylistVideos = (playlistId: string, bypassCache = false): Observable<{ lastUpdated: number; items: Video[]}> =>this.http.get<{ lastUpdated: number; items: Video[]}>(`/api/getPlaylistFeed/${playlistId}?bypassCache=${bypassCache}`).pipe(shareReplay());

  rateVideo = (videoId: string, rating: string): Observable<any> => this.http.put(`/api/video/${videoId}/rate/${rating}`, '');

  removeFromPlaylist = (playlistItemId: string): Observable<any> => this.http.put(`/api/playlistItem/remove/${playlistItemId}`, '');

  addToPlaylist = (videoId: string, playlistId: string): Observable<any> => this.http.put(`/api/video/${videoId}/addToPlaylist/${playlistId}`, '');

}