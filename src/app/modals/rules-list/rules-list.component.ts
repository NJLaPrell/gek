import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Rule } from 'src/app/state/models/rules.model';
import { selectRules } from 'src/app/state/selectors/rules.selectors';
import { selectSubscriptions } from 'src/app/state/selectors/subscriptions.selector';
import { selectPlaylists } from 'src/app/state/selectors/playlists.selectors';
import { faTrash, faEdit, faCircleCheck, faXmarkCircle, faSquarePlus } from '@fortawesome/free-solid-svg-icons'
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-rules-list',
  templateUrl: './rules-list.component.html',
  styleUrls: ['./rules-list.component.scss']
})
export class RulesListComponent implements OnInit {
  rules: Rule[] = [];
  subscriptionsList: any = {};
  subscriptions: string[] = [];
  playlistsList: any = {};
  playlists: string[] = [];
  
  faTrash = faTrash;
  faEdit = faEdit;
  faCircleCheck = faCircleCheck;
  faXmarkCircle = faXmarkCircle;
  faSquarePlus = faSquarePlus;

  constructor(
    public activeModal: NgbActiveModal,
    private store: Store
  ) { }

  ngOnInit(): void {
    this.store.select(selectRules).subscribe(r => this.rules = JSON.parse(JSON.stringify(r)));
    this.store.select(selectSubscriptions).subscribe(s => {
      s.forEach(sub => {
        this.subscriptionsList[sub.title] = sub.id;
        this.subscriptions.push(sub.title);
      });
      this.subscriptions = this.subscriptions.sort((a: string, b: string) => a.localeCompare(b));
    });
    this.store.select(selectPlaylists).subscribe(pl => {
      pl.items.forEach(p => {
        this.playlistsList[p.title] = p.id;
        this.playlists.push(p.title);
      })
      this.playlists = this.playlists.sort((a: string, b: string) => a.localeCompare(b));
    });
  }

  updateRule(r: any) {
    r.edit = false;
    console.log(r);
  }

  subTitleById(id: string): string {
    return Object.keys(this.subscriptionsList).find(k => this.subscriptionsList[k] === id) || '';
  }

  playlistTitleById(id: string): string {
    return Object.keys(this.playlistsList).find(k => this.playlistsList[k] === id) || '';
  }

  addRule(): void {
    this.rules.unshift({ id: uuid(), name: '', type: 'and', channelMatch: '', descriptionMatch: '', titleMatch: '', playlistId: '', edit: true })
  }


}
