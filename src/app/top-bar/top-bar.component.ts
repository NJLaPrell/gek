import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { faList, faClapperboard, faRotate, faHandSparkles, faTrashCan, faBomb, faArrowUpShortWide } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorBufferComponent } from '../modals/error-buffer/error-buffer.component';
import { UnsortedComponent } from '../modals/unsorted/unsorted.component';
import { RulesListComponent } from '../modals/rules-list/rules-list.component';

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
  faBomb = faBomb;
  faArrowUpShortWide = faArrowUpShortWide;

  @Output() onPlaylistsClicked: EventEmitter<void> = new EventEmitter<void>();

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  togglePlaylists() {
    this.onPlaylistsClicked.emit();
  }

  openErrorBuffer() {
    const modalRef = this.modalService.open(ErrorBufferComponent, { size: 'xl', scrollable: true });
  }

  openUnsorted() {
    const modalRef = this.modalService.open(UnsortedComponent, { size: 'xl', scrollable: true });
  }

  openRules() {
    const modalRef = this.modalService.open(RulesListComponent, { size: 'xl', scrollable: true });
  }

}
