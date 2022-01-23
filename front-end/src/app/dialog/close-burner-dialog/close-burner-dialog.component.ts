import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-close-burner-dialog',
  templateUrl: './close-burner-dialog.component.html',
  styleUrls: ['./close-burner-dialog.component.scss']
})
export class CloseBurnerDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<CloseBurnerDialogComponent>) { }

  ngOnInit(): void {}

  close() {
    this.dialogRef.close();
  }
}
