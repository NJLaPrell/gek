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

    getPlaylistVideos = (playlistId: string): Observable<Video[]> =>this.http.get<Video[]>(`/api/getPlaylistFeed/${playlistId}`).pipe(shareReplay());

}