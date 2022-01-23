import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import { ConversationsService } from 'src/app/service/conversations/conversations.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  constructor(private router: Router, private conversations: ConversationsService) { }

  ngOnInit(): void { }

  async enterCode(code: string) {
    console.log(code);
    // TODO: error handling
    await this.conversations.useExistingCode(code);
    await this.router.navigate(['chat']);
  }

  async createNewSession() {
    console.log("New Session");
    // TODO: error handling
    await this.conversations.getNewPhoneNum();
    await this.router.navigate(['chat']);
  }
}
