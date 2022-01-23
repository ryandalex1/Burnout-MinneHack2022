import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConversationsPageComponent } from './page/conversations-page/conversations-page.component';
import { LoginPageComponent } from "./page/login-page/login-page.component";

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: LoginPageComponent,
  },
  {
    path: "chat",
    component: ConversationsPageComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
