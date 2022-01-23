import { Component, OnInit } from '@angular/core';
import { MediaChange, MediaObserver} from '@angular/flex-layout';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  opened: boolean = false;
  over: string = 'over';

  private watcher: Subscription;

  constructor(media: MediaObserver) {
    this.watcher = media.asObservable().subscribe((change: MediaChange[]) => {
      if (change[0].mqAlias === 'sm' || change[0].mqAlias === 'xs') {
        this.opened = false;
        this.over = 'over';
      } else {
        this.opened = true;
        this.over = 'side';
      }
    });
  }

  ngOnInit(): void {}
}
