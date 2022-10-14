import { Component, OnInit } from '@angular/core';
import { faList, faClapperboard, faRotate, faHandSparkles, faTrashCan } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {
  faList = faList;
  faClapperboard = faClapperboard;
  faRotate = faRotate;
  faHandSparkles = faHandSparkles;
  faTrashCan = faTrashCan;

  constructor() { }

  ngOnInit(): void {
  }

}
