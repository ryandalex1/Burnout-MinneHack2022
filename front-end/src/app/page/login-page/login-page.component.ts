import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void { }

  enterCode(code: string) {
    console.log(code);
    this.router.navigate(['chat']);
  }

  createNewSession() {
    console.log("New Session");
    this.router.navigate(['chat']);
  }
}
