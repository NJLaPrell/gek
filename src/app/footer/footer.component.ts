import { Component } from '@angular/core';
import { versions } from '../../_versions';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  versions = versions;
}
