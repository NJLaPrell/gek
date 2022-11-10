import { Pipe, ChangeDetectorRef, PipeTransform, OnDestroy, NgZone } from '@angular/core';
import * as sanitize from 'sanitize-html';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';


@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  private sanitizerConfig = {
    allowedTags: sanitize.defaults.allowedTags.concat(['center', 'span', 'a', 'h1', 'h2', 'h3', 'h4', 'h5','em', 'img', 'p', 'sup', 'sub', 'em', 'strong', 'ul', 'ol', 'li']),
    selfClosing: ['img'],
    allowedSchemesByTag: {
      img: ['data', 'http', 'https']
    },
    allowedAttributes: {
      span: ['longitude', 'latitude', 'normalized', 'country', 'type', 'class', 'data-id', 'data-reported', 'style'],
      div: ['width', 'class', 'style'],
      pre: ['class'],
      hr: ['class'],
      a: ['href', 'name', 'target'],
      h1: ['style'],
      h2: ['style'],
      h3: ['style'],
      h4: ['style'],
      h5: ['style'],
      img: ['src', 'alt', 'style', 'title', 'width', 'height'],
      p: ['style']
    }
  };
  constructor(private domSanitizer: DomSanitizer) {}

  public transform(value: string): any {
    // Run the HTML for the message through sanitize to ensure we only let through
    // the tags and attributes we want. If we rely on domSanitizer.bypassSecurityTrustHtml
    // it lets everything through which is bad. After we've specifically set the allowable
    // tags and attributes, run that output through domSanitizer.bypassSecurityTrustHtml
    const cleanedHtml =  sanitize(value, this.sanitizerConfig);
    return this.domSanitizer.bypassSecurityTrustHtml(cleanedHtml);
  }
}

@Pipe({ name: 'durationFromISO' })
export class DurationFromIsoPipe implements PipeTransform {
  public transform(duration: string): string {
    const d = moment.duration(duration);
    const hrs = d.hours();
    const min = d.minutes();
    const s = d.seconds();
    return (hrs ? (hrs < 10 ? '0' : '') + String(hrs) + ':' : '') +
      (min < 10 ? '0' : '') + String(min) + ':' +
      (s < 10 ? '0' : '') + String(s);
  }
}

@Pipe({ name: 'durationFromSeconds' })
export class DurationFromSeconds implements PipeTransform {
  public transform(t: number): string {
    const secNum = parseInt(String(t), 10); 
    const hNum   = Math.floor(secNum / 3600);
    const mNum = Math.floor((secNum - (hNum * 3600)) / 60);
    const sNum = secNum - (hNum * 3600) - (mNum * 60);

    const hString = hNum 
      ? (hNum < 10 ? '0' : '') + String(hNum) + ':'
      : '';
    const mString = (mNum < 10 ? '0' : '') + String(mNum);
    const sString = (sNum < 10 ? '0' : '') + String(sNum);

    return `${hString}${mString}:${sString}`;
  }
}

@Pipe({ name: 'fromNow' })
export class FromNowPipe implements PipeTransform {
  public transform(dateVal: any) {
    return moment(dateVal).fromNow();
  }
}

@Pipe({ name: 'viewCount' })
export class ViewCountPipe implements PipeTransform {
  public transform(views: number | undefined) {
    return (views || 0 > 999) ? ((views || 0) / 1000).toFixed(1) + 'K' : String(views);
  }
}

@Pipe({ name: 'thumbCount' })
export class ThumbCountPipe implements PipeTransform {
  public transform(count: number | undefined) {
    return count ? Number(count).toLocaleString() : '';
  }
}

// https://github.com/urish/ngx-moment/blob/master/src/time-ago.pipe.ts
// https://github.com/urish/ngx-moment
// Latest commit f2ce097 on Dec 20, 2021
/* ngx-moment (c) 2015, 2016 Uri Shaked / MIT Licence */
@Pipe({ name: 'amTimeAgo', pure: false })
export class TimeAgoPipe implements PipeTransform, OnDestroy {
  private currentTimer!: number | null;

  private lastTime!: number;
  private lastValue: moment.MomentInput;
  private lastOmitSuffix!: boolean;
  private lastLocale?: string;
  private lastText!: string;
  private formatFn!: (m: moment.Moment) => string;

  constructor(private cdRef: ChangeDetectorRef, private ngZone: NgZone) {}

  format(m: moment.Moment) {
    return m.from(moment(), this.lastOmitSuffix);
  }

  transform(
    value: moment.MomentInput,
    omitSuffix?: boolean,
    formatFn?: (m: moment.Moment) => string,
  ): string {
    if (this.hasChanged(value, omitSuffix)) {
      this.lastTime = this.getTime(value);
      this.lastValue = value;
      this.lastOmitSuffix = omitSuffix || false;
      this.lastLocale = this.getLocale(value) || '';
      this.formatFn = formatFn || this.format.bind(this);
      this.removeTimer();
      this.createTimer();
      this.lastText = this.formatFn(moment(value));
    } else {
      this.createTimer();
    }

    return this.lastText;
  }

  ngOnDestroy(): void {
    this.removeTimer();
  }

  private createTimer() {
    if (this.currentTimer) {
      return;
    }

    const momentInstance = moment(this.lastValue);
    const timeToUpdate = this.getSecondsUntilUpdate(momentInstance) * 1000;

    this.currentTimer = this.ngZone.runOutsideAngular(() => {
      if (typeof window !== 'undefined') {
        return window.setTimeout(() => {
          this.lastText = this.formatFn(moment(this.lastValue));

          this.currentTimer = null;
          // eslint-disable-next-line angular/module-getter
          this.ngZone.run(() => this.cdRef.markForCheck());
        }, timeToUpdate);
      } else {
        return null;
      }
    });
  }

  private removeTimer() {
    if (this.currentTimer) {
      window.clearTimeout(this.currentTimer);
      this.currentTimer = null;
    }
  }

  private getSecondsUntilUpdate(momentInstance: moment.Moment) {
    const howOld = Math.abs(moment().diff(momentInstance, 'minute'));
    if (howOld < 1) {
      return 1;
    } else if (howOld < 60) {
      return 30;
    } else if (howOld < 180) {
      return 300;
    } else {
      return 3600;
    }
  }

  private hasChanged(value: moment.MomentInput, omitSuffix?: boolean): boolean {
    return (
      this.getTime(value) !== this.lastTime ||
      this.getLocale(value) !== this.lastLocale ||
      omitSuffix !== this.lastOmitSuffix
    );
  }

  private getTime(value: moment.MomentInput): number {
    if (moment.isDate(value)) {
      return value.getTime();
    } else if (moment.isMoment(value)) {
      return value.valueOf();
    } else {
      return moment(value).valueOf();
    }
  }

  private getLocale(value: moment.MomentInput): string | null {
    return moment.isMoment(value) ? value.locale() : moment.locale();
  }
}
