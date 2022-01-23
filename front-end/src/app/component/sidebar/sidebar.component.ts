import {Component, Input, OnInit} from '@angular/core';
import { MediaChange, MediaObserver} from '@angular/flex-layout';
import {map, scan, Subject, Subscription, takeUntil, takeWhile, timer} from "rxjs";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {CloseBurnerDialogComponent} from "../../dialog/close-burner-dialog/close-burner-dialog.component";
import {NewConversationDialogComponent} from "../../dialog/new-conversation-dialog/new-conversation-dialog.component";
import {ConversationsService} from "../../service/conversations/conversations.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  phoneNumber: string = "";
  code: string = "";
  expiryTimeString: Subject<string> = new Subject<string>();

  opened: boolean = false;
  over: string = 'over';

  private watcher: Subscription;

  constructor(media: MediaObserver, public dialog: MatDialog, public conversations: ConversationsService) {
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

  closeBurnerDialog() {
    this.dialog.open(CloseBurnerDialogComponent);
  }

  newConvDialog() {
    this.dialog.open(NewConversationDialogComponent).afterClosed().subscribe(phoneNum => {
      // TODO: actually do stuff with phone number
      console.log(phoneNum);
    });
  }

  ngOnInit(): void {
    const { nextNumber, accessCode, validUntil } = this.conversations.codeDetails!;
    this.phoneNumber = nextNumber;
    this.code = accessCode;
    const secondsUntilExpiry = (validUntil.valueOf() - Date.now()) / 1000.0;
    timer(0, 1000).pipe(
      map((secsElapsed) => secondsUntilExpiry - secsElapsed),
      takeWhile((value => value > 0)),
      map((x) => x.toString())
    ).subscribe(this.expiryTimeString)
  }
}
