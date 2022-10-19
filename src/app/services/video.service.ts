import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Video } from "../state/models/video.model";
import { map, Observable, shareReplay } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class VideoService {
    constructor(
        private http: HttpClient
    ) { }

    getChannelVideos = (channelId: string): Observable<Video[]> =>this.http.get<Video[]>(`/api/getChannelFeed/${channelId}`).pipe(shareReplay());

    getPlaylistVideos = (playlistId: string, useGApi: boolean = true): Observable<Video[]> =>this.http.get<Video[]>(`/api/getPlaylistFeed/${playlistId}?useGApi=${useGApi}`).pipe(shareReplay());

    addToPlaylist = (videoId: string, playlistId: string): Observable<any> => this.http.put(`/api/video/${videoId}/addToPlaylist/${playlistId}`, '');

}