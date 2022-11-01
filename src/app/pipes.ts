import { Pipe, PipeTransform } from '@angular/core';
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
