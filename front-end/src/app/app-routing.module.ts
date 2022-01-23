import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardGuard } from './auth-guard/auth-guard.guard';
import { DeauthGuardGuard } from './deauth-guard/deauth-guard.guard';
import { ConversationsPageComponent } from './page/conversations-page/conversations-page.component';
import { LoginPageComponent } from "./page/login-page/login-page.component";

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: LoginPageComponent,
    canActivate: [DeauthGuardGuard]
  },
  {
    path: "chat",
    component: ConversationsPageComponent,
    canActivate: [AuthGuardGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
