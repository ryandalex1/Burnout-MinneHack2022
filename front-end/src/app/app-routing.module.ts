import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConversationsPageComponent } from './conversations-page/conversations-page.component';
import { LoginPageComponent } from "./page/login-page/login-page.component";

const routes: Routes = [
  {
    path: "chat",
    component: ConversationsPageComponent
  },
  {
    path: '',
    pathMatch: 'full',
    component: LoginPageComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
