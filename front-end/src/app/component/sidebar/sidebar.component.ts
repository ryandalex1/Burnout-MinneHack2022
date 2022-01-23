import { Component, OnInit } from '@angular/core';
import { MediaChange, MediaObserver} from '@angular/flex-layout';
import {Subscription} from "rxjs";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {CloseBurnerDialogComponent} from "../../dialog/close-burner-dialog/close-burner-dialog.component";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  opened: boolean = false;
  over: string = 'over';

  private watcher: Subscription;

  constructor(media: MediaObserver, public dialog: MatDialog) {
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

  openDialog() {
    this.dialog.open(CloseBurnerDialogComponent);
  }

  ngOnInit(): void {}
}
