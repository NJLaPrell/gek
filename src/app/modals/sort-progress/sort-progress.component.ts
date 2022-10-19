import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { SortService } from '../../services/sort.service';

@Component({
  selector: 'app-sort-progress',
  templateUrl: './sort-progress.component.html',
  styleUrls: ['./sort-progress.component.scss']
})
export class SortProgressComponent implements OnInit {
  output: string = '';
  constructor(
    public activeModal: NgbActiveModal,
    private sortService: SortService
  ) {
    //this.output$ = this.sortService.runSortService();
    this.sortService.runSortService().subscribe(r => r.text().then(v => this.output = v));
  }
  //response.body.pipeThrough(new TextDecoderStream()).getReader();
  ngOnInit(): void {
    
  }

}
