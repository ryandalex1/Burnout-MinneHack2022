import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import { Router } from '@angular/router';
import { ConversationsService } from 'src/app/service/conversations/conversations.service';

@Component({
  selector: 'app-close-burner-dialog',
  templateUrl: './close-burner-dialog.component.html',
  styleUrls: ['./close-burner-dialog.component.scss']
})
export class CloseBurnerDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<CloseBurnerDialogComponent>, private convo: ConversationsService, private router: Router) { }

  ngOnInit(): void {}

  async endSession() {
    await this.convo.endSession();
    await this.router.navigateByUrl("/");
    this.close();
  }

  close() {
    this.dialogRef.close();
  }
}
