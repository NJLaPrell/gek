import { Video } from "./video.model";
// ###################################
// ## HELPER CLASS
// ###################################

export class NavStateHelper {
    navState: NavState;

    constructor(props: NavStateProps) {
        const videoIndex = props.videoList ? props.videoList.findIndex(v => v.id === props.videoId) : -1;
        const video = props.videoId && props.videoList ? props.videoList.find(v => v.id === props.videoId) : false;
        this.navState = {
          pageTitle: (props.titleLookup ? props.titleLookup[props.playlistId] : '') + (video ? ' > ' + video.title : ''),
          playlistId: props.playlistId,
          playlistTitle: props.titleLookup ? props.titleLookup[props.playlistId] : '',
          videoId: video ? video.id : false,
          videoTitle: video ? video.title : false,
          previousVideo: props.videoList && videoIndex > 0 ? props.videoList[videoIndex - 1] : false,
          currentVideo: video || false,
          nextVideo: props.videoList && videoIndex <= props.videoList.length ? props.videoList[videoIndex + 1] : false
        }
    }

    get = (): NavState => <NavState>this.navState;
}

// ###################################
// ## NAVSTATE MODEL
// ###################################

export interface NavState {
    pageTitle: string;
    playlistId: string;
    playlistTitle: string;
    videoId: string | false;
    videoTitle: string | false;
    previousVideo: Video | false;
    currentVideo: Video | false;
    nextVideo: Video | false;
}

export const initialNavState = <NavState> {
    pageTitle: '',
    playlistId: '',
    playlistTitle: '',
    videoId: false,
    videoTitle: false,
    previousVideo: false,
    currentVideo: false,
    nextVideo: false
}

export interface NavStateProps {
    playlistId: string,
    videoId: string | false,
    videoList: Video[] | false,
    titleLookup: {[key: string] : string} | false
}


