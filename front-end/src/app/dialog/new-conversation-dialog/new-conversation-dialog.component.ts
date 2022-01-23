import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-new-conversation-dialog',
  templateUrl: './new-conversation-dialog.component.html',
  styleUrls: ['./new-conversation-dialog.component.scss']
})
export class NewConversationDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<NewConversationDialogComponent>) { }

  closeDialog(result: string) {
    this.dialogRef.close(result)
  }

  ngOnInit(): void { }
}
