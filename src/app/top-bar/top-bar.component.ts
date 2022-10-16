import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { faList, faClapperboard, faRotate, faHandSparkles, faTrashCan, faBomb } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorBufferComponent } from '../modals/error-buffer/error-buffer.component';

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

}
