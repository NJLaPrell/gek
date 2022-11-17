import { Component, Input, OnInit, Output, EventEmitter, ElementRef, ViewChild, ChangeDetectorRef, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-video-embed',
  templateUrl: './video-embed.component.html',
  styleUrls: ['./video-embed.component.scss']
})
export class VideoEmbedComponent implements OnInit {
  @Input() videoId!: string;
  @Input() quality: YT.SuggestedVideoQuality = 'highres';
  @Input() autoPlay = true;
  width = 0;
  height = 0;
  start = 0;
  videoTimer: any;
  api: any;

  @Output() stateChange: EventEmitter<YT.OnStateChangeEvent> = new EventEmitter<YT.OnStateChangeEvent>();
  @Output() ready: EventEmitter<YT.PlayerEvent> = new EventEmitter<YT.PlayerEvent>();
  @Output() apiChange: EventEmitter<YT.PlayerEvent> = new EventEmitter<YT.PlayerEvent>();
  @Output() videoEnded: EventEmitter<YT.OnStateChangeEvent> = new EventEmitter<YT.OnStateChangeEvent>();
  @Output() almostOver: EventEmitter<YT.OnStateChangeEvent> = new EventEmitter<YT.OnStateChangeEvent>();
  @Output() error: EventEmitter<{ message: string; error: any }> = new EventEmitter<{ message: string; error: any }>();

  @ViewChild('player') player!: ElementRef<HTMLDivElement>;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
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

  ngOnChanges(changes: SimpleChanges) {
    if (this.api && this.autoPlay && changes['videoId'].currentValue && changes['videoId'].currentValue !== changes['videoId'].previousValue) {
      setTimeout(() => {
        try {
          this.api.playVideo();
        } catch (e) {
          this.error.emit({ message: 'Error playing video.', error: e });
        }
      }, 1000);
    }
  }

  // Fit the video player width with the page.
  onResize = (): void => {
    if (!this.player)
      return;
    this.width = Math.min(this.player.nativeElement.clientWidth, 1200);
    this.height = this.width * 0.6;
    this._changeDetectorRef.detectChanges();
  };

  onStateChange(e: YT.OnStateChangeEvent) {
    this.stateChange.emit(e);
    if (e.data === 0) {
      this.videoEnded.emit(e);
    } else {
      // Set a timer for when the video is 30 seconds from the end.
      const duration = e.target.getDuration();
      const endMark = duration - 30;
      const currentMark = e.target.getCurrentTime();
      const secondsToEndMark = endMark - currentMark;
      if (secondsToEndMark > 0) {
        clearTimeout(this.videoTimer);
        this.videoTimer = setTimeout(() => this.almostOver.emit(e), secondsToEndMark * 1000);
      }
    }
  }

  onReady(e: YT.PlayerEvent) {
    this.ready.emit(e);
    this.api = e.target;
  }

  onApiChange(e: YT.PlayerEvent) {
    this.apiChange.emit(e);
  }

}
