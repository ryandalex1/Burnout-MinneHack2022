import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import { ConversationsService } from 'src/app/service/conversations/conversations.service';

@Component({
  selector: 'app-new-conversation-dialog',
  templateUrl: './new-conversation-dialog.component.html',
  styleUrls: ['./new-conversation-dialog.component.scss']
})
export class NewConversationDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<NewConversationDialogComponent>, private convo: ConversationsService) { }

  closeDialog(result: string) {
    this.convo.messages.set(result, []);
    this.dialogRef.close(result);
  }

  ngOnInit(): void { }
}
